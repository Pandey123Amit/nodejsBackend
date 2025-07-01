"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    host: 'live.smtp.mailtrap.io',
    port: 587,
    secure: false, // use SSL
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_APP_PASSWORD
    }
});
const sendEmail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=emailSend.js.map