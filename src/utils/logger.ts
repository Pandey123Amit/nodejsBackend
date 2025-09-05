// learn form blog 


import winston from "winston";
import "winston-daily-rotate-file";

const logDir = "logs"; 

const transport = new winston.transports.DailyRotateFile({
  filename: `${logDir}/app-%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d", 
  zippedArchive: true
});

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    transport,
    new winston.transports.Console() // optional: also log to console
  ]
});



 //logger.debug(""); for debug
// logger.info(""); if we want after sucessful 
// logger.warn(""); when something not a issue but we have to know
// logger.error(); when sometime error occur