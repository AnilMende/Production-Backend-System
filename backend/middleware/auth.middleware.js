import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

import jwt from 'jsonwebtoken';

//middleware to verify the jwt token 
// if jwt.verify happens first, if attacker steals refresh token
//it will pass jwt.verify() until it expires
//-> JWT only proves token was signed with the secret key
//-> DB proves token is still valid session
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    //hash incoming token
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    //Check DB first , find the user with this refreshToken
    const user = await User.findOne({  refreshToken: hashedToken });

    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    //validate the token with jwt
    try {

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token")
    }

    //if the user is available add the new user in the request
    req.user = user;
    req.refreshToken = token;

    next();

})


//verifyAccessToken middleware is for protecting routes
//validates the accessToken and allows the request to proceed only if the token is valid

export const verifyAccessToken = asyncHandler(async (req, res, next) => {

    //get token from the authorization header
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new ApiError(401, "Access token required");
    }

    //Authorization : "Bearer AccessToken"
    //we only need the AccessToken, to validate the token, we need to remove the word Bearer
    //split(" ") -> turns the string into an array by breaking it at the space
    //now index[0] = Bearer and index[1] = AccessToken that is actual token
    //By selecting index 1 we get the accessToken that is accessing the array
    const token = authHeader.split(" ")[1];

    //verify the token which is accessToken
    try {
        
        const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401, "User not found");
        }

        req.user = user;

        next();

    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }
})