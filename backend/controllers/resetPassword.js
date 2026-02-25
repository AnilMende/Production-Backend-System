import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import crypto from "node:crypto";

import bcrypt from 'bcrypt';

export const resetPassword = asyncHandler(async (req, res) => {

    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token) {
        throw new ApiError(400, "Token Missing");
    }

    if(!newPassword){
        throw new ApiError(400, "New Password required");
    }

    if(newPassword.length < 8){
        throw new ApiError(400, "Password too short");
    }

    //hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    //find the user with the hashedToken
    const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    //hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password
    user.password = hashedPassword;

    //invalidate token
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, "Password Reset successful")
    )
})