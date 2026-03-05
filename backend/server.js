import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from "morgan";
import fs from "fs";
import path from "path";

import connectDB from './lib/db.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';

import logger from './utils/logger.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { timeStamp } from 'console';

const PORT = process.env.PORT || 4000;

const app = express();

const accessLogStream = fs.createWriteStream(
    path.join("logs", "access.log"),
    {flags : "a"}
)
app.use(morgan("combined", { stream : accessLogStream }));

//middleware
app.use(express.json());

//CORS
app.use(cors({
    origin : "http://localhost:3000",
    methods : ['GET', 'POST', 'PUT', 'DELETE'],
    //Necessary for cookies or authorization headers
    credentials : true,
    //Some older browsers and certain SmartTVs do not handle the default 204 No Content response 
    // for preflight (OPTIONS) requests well. By default optionsScuccessStatus is 204
    optionsSuccessStatus : 200
}));

//Using helmet with default settings
app.use(helmet());

app.use(cookieParser());

//routes 

//auth api end point
app.use("/api/v1/auth", authRouter);
//user api end point
app.use("/api/v1/user", userRouter);
//admin api end point
app.use("/api/admin", adminRouter);

//connect to MongoDB
await connectDB();

//Root Route
app.get("/", (req,res) => {
    res.send("Production Backend System API running");
});

app.listen(PORT, () => { 
    logger.info(`Server started at ${PORT}`)
});

app.use(errorMiddleware);