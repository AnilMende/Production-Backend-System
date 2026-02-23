import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


export const resendVerification = asyncHandler(async (req,res) => {
    //1.get email
    const { email } = req.body;

    //2.find user
    const user = await User.findOne({ email });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    //3. check if already verified
    if(user.isVerified){
        throw new ApiError(400, "User already verified");
    }

    //4. generate new token
    const rawToken = crypto.randomBytes(32).toString("hex");

    //hash the rawToken
    const hashedToken = crypto.createHash("sha256").update(rawToken).diget("hex");

    //5. overwrite old token
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${rawToken}`;

    //6. send Email
    await sendEmail({
        email : user.email,
        subject : "Resend Verification", 
        html : `<a href="${verificationUrl}">Verify</a>`
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Verification email resent")
    );
})