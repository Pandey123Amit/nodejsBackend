"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const logDir = "logs"; // folder to store logs
const transport = new winston_1.default.transports.DailyRotateFile({
    filename: `${logDir}/app-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d", // keep logs for 14 days
    zippedArchive: true
});
exports.logger = winston_1.default.createLogger({
    level: "debug",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)),
    transports: [
        transport,
        new winston_1.default.transports.Console() // optional: also log to console
    ]
});
//logger.debug(""); for debug
// logger.info(""); if we want after sucessful 
// logger.warn(""); when something not a issue but we have to know
// logger.error(); when sometime error occur
//# sourceMappingURL=logger.js.map