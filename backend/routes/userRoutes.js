import express from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { deleteUser,  getUserProfile, updateUser } from '../controllers/userController.js';

const userRouter = express.Router();

//=> USER ROUTES:

//=> these routes are handled by the user
//the admin also able to get their profile, update their account, and delete themselves so 
//if we pass user for the authorizeRoles(), then the admin will not be able to do all this
//so we are removing the role check for below routes

//-> using authorizeRoles("user") -> is not a best practice

//get user data
userRouter.get("/profile", verifyAccessToken, getUserProfile);
//update user data
userRouter.put("/update/:id", verifyAccessToken, updateUser);
//delete user
userRouter.delete("/remove/:id", verifyAccessToken, deleteUser);

export default userRouter;