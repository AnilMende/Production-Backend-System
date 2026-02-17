import express from 'express';
import { handleLogin, handleLogout, handleRefresh, handleRegister } from '../controllers/authController.js';
import { verifyRefreshToken } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post("/register", handleRegister);
authRouter.post("/login", handleLogin);

//middleware validates, controller rotates
authRouter.post("/refresh-token", verifyRefreshToken, handleRefresh);

//handle Logout
authRouter.put("/logout", handleLogout);

export default authRouter;