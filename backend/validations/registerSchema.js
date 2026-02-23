import Joi from "joi";

export const  registerSchema = Joi.object({
    username : Joi.string().alphanum().min(4).max(14).required(),
    email : Joi.string().email().required().lowercase(),
    password : Joi.string().min(8).required()
})