import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './lib/db.js';

const PORT = process.env.PORT || 4000;

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes 
app.get("/", (req,res) => {
    res.send("Server is Live");
})

//connect to MongoDB
connectDB();

app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));