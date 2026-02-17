import express from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { deleteUser, getUserProfile, updateUser } from '../controllers/userController.js';

const userRouter = express.Router();

//get user data
userRouter.get("/profile", verifyAccessToken, getUserProfile);
//update user data
userRouter.put("/update/:id", verifyAccessToken, updateUser);
//delete user
userRouter.delete("/remove/:id", verifyAccessToken, deleteUser);

export default userRouter;