-> Libraries Installed : express, nodemon, jsonwebtoken, cors, bcrypt, mongoose, dotenv, validator.
-> Global Error Handler : ApiError extends Error class acts as the global error wrapper
-> ApiResponse : A standardized API response wrapper class is used in backend projects, to make every API response follow the same structure.
-> AsyncHandler : This is a utility wrapper for Express.js async controllers, To avoid the repeated try/catch inside the route we use the wrapper.
Express doesn't handle async errors by default so by wrapping the async controller inside the asyncHandler will helps to identify the errors. Without this wrapper if we forget try/catch server crashes,
inconsitent error handling, repetitive code, with this wrapper all async error go to one place.
-> asyncHandler is a safety net around every controller.

-> Added functions to generate accessToken and refreshToken. AccessToken Short lived, used for API authorization.
Authentication must answer one question where does the tokens stored so that attacker cannot access them, browser stores the cookies.
RefreshToken : Long Lived, Used only to get new access Token. Both must be protected , if access token lekas short damage, If refresh token leaks permanent access goes to the attacker.
By storing them in the cookies protects both of them. cookies are htttpOnly : true means the cookie is automatically sent with every relevant HTTP request to the server by the browser.
The server can read and modify the cookies via http headers, but the client script cannot.

-> we have to hash the refreshToken before storing it in the database, Because a refreshToken is a long term session key. If someone steals the actual refreshToken they can generate new access token, and refresh token and stay logged in.So we protect in the same way we protect password, we store the hash of the refreshToken in database. By this the hash is not usuable as a refresh token, because to refresh a session
server expects a real refresh token not hashed refresh token. So attacker with only the hash cannot use it which cannot generate real token.

-> handleRegister , handleLogin are the controllers for the register and login.
