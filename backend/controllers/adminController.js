import User from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

//Controllers Handled By the Admin
//=> to get all the users
export const getAllUsers = asyncHandler(async (req, res) => {

    const users = await User.find().select("-password -refreshToken -verificationToken -resetToken");

    return res.status(200).json(
        new ApiResponse(200, users, "All users fetched")
    )
})

//=> delete user by Admin
export const deleteUserByAdmin = asyncHandler(async (req, res) => {

    //here there is posibility of Admins deleting their own account
    //then system loses admins access, there is no way to recover
    //in this req.user.__id is admins Id
    //req.params.id -> passed id of the user for deletion
    //these deletion is performed by admin,
    // if both of them are equal then admin details are going to delete.

    //these details are never going to be equal, admin is going to delete user.
    //i.e admin.id !== deletedUser.id
    if (req.user._id.toString() === req.params.id) {
        throw new ApiError(400, "Admin can not delete their own account");
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //Admin can not delete other admins
    if (user.role === "admin") {
        throw new ApiError(403, "Cannot delete another admin");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted by Admin")
    )
})

//=> Block a particular user by Admin
export const blockUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //if the user is already blocked?
    if (user.isBlocked) {
        throw new ApiError(400, "User already Blocked");
    }

    //make isBlocked to true if user exists and not blocked
    user.isBlocked = true;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "User Blocked")
    );
})

//=> Unblock User By Id;
export const unblockUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(400, "User not found");
    }
    //unblock user by setting isBlocked to false
    user.isBlocked = false;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "User unblocked")
    )
})