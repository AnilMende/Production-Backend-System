import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import connectDB from './lib/db.js';

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 4000;

const app = express();

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
app.get("/", (req,res) => {
    res.send("Server is Live");
})

//auth api end point
app.use("/api/auth", authRouter);
//user api end point
app.use("/api/user", userRouter);

//connect to MongoDB
await connectDB();

app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));