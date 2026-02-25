import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

import crypto from "node:crypto";

export const verifyEmail = asyncHandler(async (req, res) => {

    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Token Missing");
    }

    //hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    //find the user from db with token + not expired
    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    //if the user is avialable with the verificationToken
    user.isVerified = true;

    //remove token fields because user is already verified
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    //save the user
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
})