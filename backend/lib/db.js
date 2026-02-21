import mongoose from "mongoose";
//import dotenv from 'dotenv';
//dotenv.config();
//MONGODB_URI="mongodb+srv://anilmende:anilmende123@cluster0.ehwaxku.mongodb.net"
//MONGODB_URI="mongodb://localhost:27017"
const connectDB = async () => {
    try {

        await mongoose.connect(`${process.env.MONGODB_URI}/prod-app`)
        console.log("Database Connected");
        
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;