import { ApiError } from "../utils/ApiError";

//this validate used inside the routes as a middleware by passing the login or register Schemas
//req.body will contain the valid user data and access is passed to login or regiser controller
export const validate = (schema) => (req, res, next) => {

    const { error, value } = schema.validate(req.body);

    if(error){
        throw new ApiError(400, error.details[0].message);
    }

    req.body= value;
    next();
}