import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import redisClient from "../utils/redisClient.js";

//To get the user details
export const getUserProfile = asyncHandler(async (req, res) => {

    //this is the id of the logged in user
    //req.user._id comes from the verifyAccessToken middleware
    const userId = req.user._id;

    // Request → Check Redis
    //     → If found → return
    //     → If not → fetch DB → store in Redis → return

    //1.check cache
    const cachedUser = await redisClient.get(`user:${userId}`);

    if (cachedUser) {
        return res.status(200).json(
            new ApiResponse(200, JSON.parse(cachedUser), "User fetched from cache")
        )
    }

    //2. If data not in Redis then Fetch from DB
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //3. Store in cache (TTL=300sec == 5min)
    await redisClient.set(`user:${userId}`, JSON.stringify(user), { EX: 300 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User fetched from DB")
        )
})

//to update the user details
export const updateUser = asyncHandler(async (req, res) => {

    //Ensuring that the user updates their own account
    //not other users account
    //req.user._id comes from the verifyAccessToken middleware
    const userId = req.user._id;

    //Extract only safe fields from the req.body
    const { username, email } = req.body;

    //update only allowed fields
    //runValidators ensures Mongoose checks the rules like
    //unique : true or required : true
    const updatedUser = await User.findByIdAndUpdate(userId,
        { $set: { username, email } },
        { new: true, runValidators: true }).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    //cache invalidation
    if (updatedUser) {
        await redisClient.del(`user:${userId}`);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "Profile updated successfully")
        )
})

//to delete the user
export const deleteUser = asyncHandler(async (req, res) => {

    //Authorization check
    //req.user._id comes from the middleware verifyAccessToken
    const userId = req.user._id;

    //perform deletion and capture result
    //helpful when user enters the non existing user id,
    //using findByIdAndDelete will return the deleted users document
    //if the user with id existed the deletedUser will contains the user's data
    //if the user with id didn't exist, deletedUser will be null

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.refreshToken = undefined;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    //cache invalidation => remove user from redis cache
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`users:all`);

    //clear cookies 
    return res
        .status(200)
        .clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        })
        .json(new ApiResponse(200, {}, "Account deleted successfully"));
})
