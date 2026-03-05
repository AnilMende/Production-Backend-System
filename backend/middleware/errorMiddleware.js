import logger from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    //log the error
    logger.error({
        message : message,
        stack : err.stack,
        method : req.method,
        url : req.originalUrl
    });

    res.status(statusCode).json({
        success : false,
        message
    });

}