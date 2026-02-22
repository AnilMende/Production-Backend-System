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

//validation schemas
import { loginSchema } from '../validations/loginSchema.js';
import { registerSchema } from '../validations/registerSchema.js';
import { getSystemErrorMessage } from 'node:util';

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

    //req.body gets validated data using the middleware in register route
    const { username, email, password } = req.body;

    //Check for existing user (using $or to check both at once)
    const exists = await User.findOne({ $or: [{ username }, { email }] });

    if (exists) {
        throw new ApiError(409, "User with this email or username already exists");
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

    //using the validated data from the middleware (req.body contains santizied fields)
    const { email, password } = req.body;

    //to avoid the errors if the user logins with emial which has upperCase letters
    //no need of email.toLowerCase() because Joi already hadles it
    const user = await User.findOne({ email });

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

//handleRefresh helps in generating the new access and refresh tokens
export const handleRefresh = asyncHandler(async (req, res) => {

    const user = req.user;

    //generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    //hash the newRefreshToken to store it in the DB
    const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");

    user.refreshToken = hashedRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
        .status(200)
        .json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken },
                "Access Token refreshed"
            )
        )
})

//handle Logut by clearing the refreshToken
//-> this works when attcker stole refresh token, user clicks logut , refresh token is cleared
//-> when token expired, User clicks logout, cookie cleared anyway
//-> when DB compromised, Hashed tokens still safe.
export const handleLogout = asyncHandler(async (req, res) => {

    //read refresh token from the cookies
    const token = req.cookies?.refreshToken;

    if (token) {
        //hash the refresh token
        const hashedRefreshToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        //find user with matching hash
        await User.findOneAndUpdate(
            { refreshToken: hashedRefreshToken },
            { $set: { refreshToken: null } }
        );
    }

    return res
        .status(200)
        .clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        })
        .json(new ApiResponse(200, {}, "Logged Out Successfully"));
})

