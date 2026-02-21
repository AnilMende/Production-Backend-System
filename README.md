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

-> Refresh Token Endpoint : 
Read refresh token from cookie,
Hash the refresh token,
compare the Hashed refresh token with the refresh token in Database,
Verify JWT,
Generate new Access and Refresh Tokens,
Replace Old Refresh Token.
-> verifyRefreshToken is the middleware to verify the jwt token , if jwt.verify happens first, if attacker steals refresh token it will pass jwt.verify() until it expires
-> JWT only proves token was signed with the secret key, DB proves token is still valid session
-> handleRefresh is the controller to generate new Access and Refresh Tokens.

->Logut Endpoint: 
read refresh token from cookie,
Hash the refresh token,
Find user with matching hash,
if found clear the refresh token from database,
otherwise clear cookie any way using clearCookie("refreshToken'),
Logut always succeds even if token is expired or tampered.

-> Frontend may call logout when token already expired, cookie corrupted, user manually logout.

-> AccessToken middleware is a standard security practice for protecting routes. It intercepts incoming requests, validates the token and allows the request to proceed only if the token is valid.
-> From the frontend AccessToken is stored in the Authrization header that is Authorization : Bearer <AccessToken>, client includes the AccessToken in the header of subsequent API requests.
-> Used wth REST APis, to access resources such as userData, documents and services, for verification of the accessToken get the token from Authorization header, and split the Bearer and AccessToken by using space between them, and verify this token using the jwt, and store the user in the request to use in other controllers.
->The user controller functions are getUserProfile(get), updateUser(PUT), deleteUser(delete). The user can be passed from the verifyAccessToken middleware.
Use findByIdAndDelete to remove the document, which requires only one round trip to database, Every time you use await your server hash to wait for a response from the database.

=> Rate Limiting : is the process of limiting the number of requests client can make in a given period of time. At first I have implemented a Custom limiter which is Fixed window rate limitng algorithm. It involves various steps, a store is initialized which is an object helps to store the ip address with the count and resetTime.

-> If the ip address is not in the loginAttempts then add the ip adderess and with count 1 and resetTime is Date.now() + windowMs, windowMs means how long to remember a request in milliseconds, if the ip address already available in the loginAttempts then increment the count by 1.

-> if the count of the ip address in the loginAttempts is greater than the limit or maxAttempts which is the max number of requests a client can make in the windowMs i.e.. in a session.

-> This results in the error Too many requests with 429 status code. The middleware stops the request and it does not call next. we can apply this middleware that is rateLimiter to the routes like login.

-> And this custome rate limiter also has problems because, it is memory based storage, loginAttempts lives in the memory, if server restarts limiter resets, if there are multiple servers limiter useless. Attackers can bypass limit by restarting connection, hitting different server instances. This is IP based only so weak protection because Many users share same IP address like colleges or hostels. With Proxies and VPN's easily bypassed. No deleting of old IP addresses, server memory increases and slows down. If the multiple requests hit simulataneously incrementing the count may not be accurate.

=> We can minimize the above problems by using express-rate-limit, helps to think of it as a gatekeeper sitting in the middle of your request pipeline. It doesn't just look at the total traffic; it tracks individual "buckets" for every user.
