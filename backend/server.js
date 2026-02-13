import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './lib/db.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 4000;

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes 
app.get("/", (req,res) => {
    res.send("Server is Live");
})

//user api end point
app.use("/api/auth", userRouter);

//connect to MongoDB
await connectDB();

app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));