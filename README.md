-> Libraries Installed : express, nodemon, jsonwebtoken, cors, bcrypt, mongoose, dotenv, validator.
-> Global Error Handler : ApiError extends Error class acts as the global error wrapper
-> ApiResponse : A standardized API response wrapper class is used in backend projects, to make every API response follow the same structure.
-> AsyncHandler : This is a utility wrapper for Express.js async controllers, To avoid the repeated try/catch inside the route we use the wrapper.
Express doesn't handle async errors by default so by wrapping the async controller inside the asyncHandler will helps to identify the errors. Without this wrapper if we forget try/catch server crashes,
inconsitent error handling, repetitive code, with this wrapper all async error go to one place.
-> asyncHandler is a safety net around every controller.
