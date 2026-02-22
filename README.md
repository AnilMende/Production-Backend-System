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

=> Rate Limiting : is the process of limiting the number of requests client can make in a given period of time. At first I have implemented a Custom limiter which is Fixed window rate limitng algorithm. 

-> And this custome rate limiter also has problems because, it is memory based storage, loginAttempts lives in the memory, if server restarts limiter resets, if there are multiple servers limiter useless. Attackers can bypass limit by restarting connection, hitting different server instances. This is IP based only so weak protection because Many users share same IP address like colleges or hostels. With Proxies and VPN's easily bypassed. No deleting of old IP addresses, server memory increases and slows down. If the multiple requests hit simulataneously incrementing the count may not be accurate.

=> express-rate-limit::
=> We can minimize the above problems by using express-rate-limit, helps to think of it as a gatekeeper sitting in the middle of your request pipeline. It doesn't just look at the total traffic; it tracks individual "buckets" for every user.
-> Here is the step-by-step internal process for every incoming request:
1. Identifying the Client (Key Generation)
When a request hits your server, the middleware first needs to know who is calling.
By default, it uses the IP address (req.ip).
If you are behind a proxy (like Nginx, Heroku, or Cloudflare), you must ensure app.set('trust proxy', 1) is enabled in Express, otherwise, the limiter will see the proxy's IP for every user and block everyone at once.

2. Checking the "Store"
The middleware looks into its Store (by default, this is just an object in the server's RAM) to see if this IP has a record.
If no record exists: It creates a new entry for that IP, sets the "hits" to 1, and records the "reset time" (current time + 60 seconds).
If a record exists: It increments the hit count by 1.

3. The Validation Logic
The middleware compares the current hit count against your max value (5):
Scenario A: Count <= 5
The middleware calls next(). The request proceeds to your login controller.
Scenario B: Count > 5
The middleware stops the request. It does not call next(). Instead, it immediately sends the 429 Too Many Requests status code along with your custom JSON message.

4. Updating Headers
If standardHeaders is set to true, the middleware calculates the following values and attaches them to the response headers of every request (even the blocked ones):
Header	              Description
RateLimit-Limit	      The total limit (5).
RateLimit-Remaining	  How many tries the user has left in this minute.
RateLimit-Reset	      The Unix timestamp when the counter resets to zero.

=> Added Validation For login and register user.

->Joi is a data validator library use in Node.js, to ensure data integrity and validate incoming data such as user input, API requests and configuration files.
The Primary use of Joi in Node.js is to define a clear set of rules (a Schema) that incoming data must follow before it is processed by the application or stored in a database. This helps prevent bad data from causing errors or creating security vulnerabilities.
-> loginSchema involves the set of rules email and password data passed through req.body must follow and registerSchema contains the set of rules username, email and password must follow. These can schemas can be passed into a validator, it includes a rich set of validators for common data types like strings, numbers, dates, arrays, and more, which can be chained together for complex rules (e.g., Joi.string().min(5).max(255).required().email()).
-> Upon successful validation, Joi can return the sanitized data, stripping out unknown or unwanted fields based on the schema.
