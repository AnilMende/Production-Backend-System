import express from 'express';
import { handleLogin, handleLogout, handleRefresh, handleRegister } from '../controllers/authController.js';

import { verifyRefreshToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/authLimiter.js';
import { validate } from '../middleware/validationMiddleware.js';

import { registerSchema } from '../validations/registerSchema.js';
import { loginSchema } from '../validations/loginSchema.js';
import { emailSchema } from '../validations/emailSchema.js';

import { verifyEmail } from '../controllers/verifyController.js';
import { resendVerification } from '../controllers/resendVerification.js';

const authRouter = express.Router();

authRouter.post("/register",validate(registerSchema), handleRegister);

//email verification
authRouter.get("/verify-email", verifyEmail);

//resend-verification
authRouter.post("/resend-verification", authLimiter, validate(emailSchema), resendVerification);

//added authLimiter for the login so that it can prevent from brute force attacks.
//for the belowe route-> RateLimiter + validation + controller :
// Because : Rate limiter protects your server from abuse
//Validation protects your app from bad data
//Example : If attacker sends 1000 invalid requests, You have to block them early, 
// not waste time validating each request
authRouter.post("/login", authLimiter, validate(loginSchema), handleLogin);

//middleware validates, controller rotates
authRouter.post("/refresh-token", verifyRefreshToken, handleRefresh);

//handle Logout
authRouter.put("/logout", handleLogout);

export default authRouter;