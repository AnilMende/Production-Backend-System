import User from "../models/user";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";

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