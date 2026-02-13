import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import crypto from "node:crypto";

dotenv.config();

import User from '../models/user.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

//function to create accessToken
function generateAccessToken(user) {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//function to create refreshToken
function generateRefreshToken(user) {
    return jwt.sign(
        {
            id: user._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

//function to register a user
export const handleRegister = asyncHandler(async (req, res) => {

    //user details
    const { email, password, username } = req.body;

    //all these are fields need to be mentioned in the body
    if (!email || !password || !username) {
        throw new ApiError(400, "All fields are required");
    }

    //email format validation
    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    //existing user
    const exists = await User.findOne({ $or: [{ username }, { email }] });

    if (exists) {
        throw new ApiError(409, "User Already Exists");
    }

    //store the password for the security purposes
    //generate salt => generates random alphabtes and numbers
    const salt = await bcrypt.genSalt(10);
    //hashing the password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    //here we are storing the hashed version of the password
    const user = await User.create({
        username,
        email: email.toLowerCase(),
        password: hashedPassword
    });

    //removing the password and refreshToken from the createdUser
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(404, "Something went wrong while registering the user");
    }

    return res.status(201)
        .json(
            new ApiResponse(201, createdUser, "Registered Successfully")
        )
})


//function to handle user login
export const handleLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password required");
    }

    //to avoid the errors if the user logins with emial which has upperCase letters
    //we convert the email to the Lowercase
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    //password is compared with the user.password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    //both password and email are valid then generate tokens
    //user object is the payload
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //refreshToken stored in DB as plain text results in security issue
    //if DB leaks -> attacker gets valid refreshTokens
    //So hash the refreshToken and store the hashedrefreshToken in DB
    const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    //storing hashed refresh Token
    user.refreshToken = hashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    //sending refreshToken in httpOnly cookie
    //sending access token in response body
    //httpOnly : true means the cookie is sent with every relevant http request to the
    //server by the browser, the server can read and modify the cookie via http headers
    return res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }).status(200)
        .json(new ApiResponse(200, { accessToken }, "Login Successful"));

})

