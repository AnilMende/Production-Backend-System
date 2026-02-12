import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

import User from '../models/user.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

//function to create accessToken
function createAccessToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            username: user.username,
            email: user.email
        },
        process.env.ACCESS_SECRET_TOKEN,
        {
            expiresIn: process.env.ACCESS_SECRET_EXPIRY
        }
    )
}

//function to create refreshToken
function createRefreshToken(user) {
    return jwt.sign(
        {
            _id : user._id
        },
        process.env.REFRESH_SECRET_TOKEN,
        {
            expiresIn : process.env.REFRESH_SECRET_EXPIRY
        }
    )
}

//function to register a user
const register = asyncHandler(async (req, res) => {

})

