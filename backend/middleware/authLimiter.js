
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    //how long to remember requests for
    windowMs : 60 * 100,
    //limits each ip address to 5 requests per window
    max : 5,
    message: {
        error: "To many requests",
        message : "Please try again later"
    },
    //to include RateLimit-* headers in the response so that client can know about their remaining quota
    standardHeaders : true,
    //Disables the older X-RateLimit-* headers to keep the response clean
    legacyHeaders : false
});








// const loginAttempts = {};

// export const manualAuthLimiter = (req, res, next) => {

//     const ip = req.ip;
//     const now = Date.now();
//     //how long to remember requests for
//     const windowMs = 60000;
//     const maxAttempts = 5;

//     //initialize or increment the count that is the count of requests made by a ip address
//     //if it is the new request increment count by 1, user or ip address already existing
//     //increment the count that is number of attempts using this ip

//     //1. !loginAttempts[ip] -> new request
//     // now > loginAttempts[ip].resetTime -> request or user session expired
//     if(!loginAttempts[ip] || now > loginAttempts[ip].resetTime){
//         loginAttempts[ip] = { count : 1, resetTime : now + windowMs };
//     }else{
//         loginAttempts[ip].count++;
//     }

//     // 2. add the headers for total number of requests and for every request calculate the number of 
//     //requests remaining for the user
//     //loginAttempts[ip].count -> number of requests made by the user

//     const remaining = Math.max(0, maxAttempts - loginAttempts[ip].count );
//     //header for maxattempts that is max requests for a user
//     res.setHeader('X-RateLimit-Limit', maxAttempts);
//     res.setHeader('X-RateLimit-Remaining', remaining);

//     //3. if the number of requests made by the user in the given window of time
//     //then it should results in the 429 Too many requests error
//     if(loginAttempts[ip].count > maxAttempts){

//         //telling the user when they can login again after the maxAttempts is exceeded
//         const secondsLeft = Math.ceil((loginAttempts[ip].resetTime - now ) / 1000);
//         //header for the response to show the seconds left.
//         res.setHeader('Retry-After', secondsLeft);

//         return  res
//         .status(429)
//         .json({
//             error : "Too Many Requests",
//             message : `Please try again after ${secondsLeft} seconds`
//         });

//     }

//     next();
// }