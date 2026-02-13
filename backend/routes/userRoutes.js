import express from 'express';
import { handleLogin, handleRegister } from '../controllers/authController.js';

const userRouter = express.Router();

userRouter.post("/register", handleRegister);
userRouter.post("/login", handleLogin);


export default userRouter;