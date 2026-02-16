import express from 'express';
import { handleLogin, handleLogout, handleRefresh, handleRegister } from '../controllers/authController.js';
import { verifyRefreshToken } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.post("/register", handleRegister);
userRouter.post("/login", handleLogin);

//middleware validates, controller rotates
userRouter.post("/refresh-token", verifyRefreshToken, handleRefresh);

//handle Logout
userRouter.put("/logout", handleLogout);

export default userRouter;