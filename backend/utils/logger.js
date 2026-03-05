import winston from "winston";

const logger = winston.createLogger({
    level : "info",
    format : winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports : [

        //error logs
        new winston.transports.File({
            filename : "logs/errors.log",
            level : "error"
        }),

        //all logs
        new winston.transports.File({
            filename : "logs/combined.log"
        })
    ]
});

export default logger;