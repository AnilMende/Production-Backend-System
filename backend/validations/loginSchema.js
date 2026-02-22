import Joi from "joi";

export const loginSchema = Joi.object({
    email : Joi.string().email().required().lowercase().trim(),
    password : Joi.string().min(8).pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])')).required()
})