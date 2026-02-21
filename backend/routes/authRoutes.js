import express from 'express';
import { handleLogin, handleLogout, handleRefresh, handleRegister } from '../controllers/authController.js';
import { verifyRefreshToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/authLimiter.js';

const authRouter = express.Router();

authRouter.post("/register",  handleRegister);
//added authLimiter for the login so that it can prevent from brute force attacks.
authRouter.post("/login", authLimiter, handleLogin);

//middleware validates, controller rotates
authRouter.post("/refresh-token", verifyRefreshToken, handleRefresh);

//handle Logout
authRouter.put("/logout", handleLogout);

export default authRouter;