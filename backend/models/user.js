import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        unique : true,
    },
    refreshToken : {
        type : String
    },
    role : {
        type : String,
        enum : ['user', 'admin'],
        default : 'user'
    }
}, { timestamps : true});

const User = mongoose.model('user', userSchema);

export default User;