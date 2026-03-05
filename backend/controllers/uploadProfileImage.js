import cloudinary from "../config/cloudinary.js";
import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import redisClient from "../utils/redisClient.js";

export const uploadProfileImage = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    //1. Client sends image data.
    //2. Multer catches it and puts it into req.file.buffer
    //3. upload_stream prepares the "pipe" to Cloudinary
    //4. result.end(buffer) pours the data into that pipe and closes the server-side end
    //5. Cloudinary receives the data, processes it, 
    // and triggers the callback function once finished.

    //from the middleware verifyAccessToken
    const userId = req.user._id;

    //Upload to cloudinary
    const result = await cloudinary.uploader.upload_stream(
        { folder: "profile_images" },
        async (error, uploadResult) => {
            if (error) {
                throw new ApiError(500, "cloudinary upload failed");
            }

            //save url in DB
            const user = await User.findByIdAndUpdate(
                userId,
                { profileImage: uploadResult.secure_url },
                { new: true }
            ).select("-password -refreshToken");

            //save user in db
            //await user.save();

            //cache invalidation
            await redisClient.del(`user:${userId}`);
            await redisClient.del("users:all");

            return res.status(200).json(
                new ApiResponse(200, user, "Profile image updated")
            );
        }
    );

    //result.end(buffer) pours the data into that pipe and closes the server-side end
    result.end(req.file.buffer);
});