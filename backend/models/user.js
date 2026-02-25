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
    
    isVerified : {
        type : Boolean,
        default : false
    },
    verificationToken : {
        type : String
    },
    verificationTokenExpires : {
        type : Date
    },

    resetToken : {
        type : String
    },
    resetTokenExpires : {
        type : Date
    },

    refreshToken : {
        type : String
    },
    role : {
        type : String,
        enum : ['user', 'admin'],
        default : 'user'
    },
    isBlocked : {
        type : Boolean,
        default : false
    }
}, { timestamps : true});

const User = mongoose.model('user', userSchema);

export default User;