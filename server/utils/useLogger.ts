import winston from "winston"

const logger = winston.createLogger({
    level: process.env.VERBOSE ? "info": "error",
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
    ]
})

export const useLogger = () => logger