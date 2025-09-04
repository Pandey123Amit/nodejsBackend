"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.loginUser = exports.registerUser = void 0;
const UserModel = __importStar(require("../model/userModel"));
const users_1 = require("../utils/users");
const emailSend_1 = require("../utils/emailSend");
const dbconn_1 = __importDefault(require("../db/dbconn"));
const getLocation_1 = require("../utils/getLocation");
const logger_1 = require("../utils/logger");
const generatedAccessToken = async (user) => {
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenKey) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
    }
    const accessToken = (0, users_1.tokenGenerate)(accessTokenKey);
    const dataset = await (0, users_1.insertByColNameAndValueAndTablename)('sessions', ['access_token', 'user_id'], [accessToken, user]);
    if (!dataset) {
        throw new Error("Failed to insert session token.");
    }
    return accessToken;
};
const registerUser = async (req, res, next) => {
    const { Fname, Lname, phonenumber, email, addLine1, addLine2, city, state, country, postal_code } = req.body;
    try {
        // Check if user already exists
        const isUserExist = await (0, users_1.userExist)(email);
        if (!email || !isUserExist) {
            logger_1.logger.warn(`registerUser: User already exists or invalid email: ${email}`);
            return res.status(400).json({ message: "User already exists or invalid email" });
        }
        // Generate password
        const password = (0, users_1.genratedpassword)();
        // Insert user in DB
        const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password);
        if (!dataset) {
            logger_1.logger.error("registerUser: Failed to create user in DB");
            return res.status(500).json({ message: "Failed to create user" });
        }
        logger_1.logger.info(`registerUser: User created with ID ${dataset.id}`);
        // Send email
        let isEmailSent = false;
        isEmailSent = await (0, emailSend_1.sendEmail)({
            from: process.env.SENDER_EMAIL,
            to: dataset.email,
            subject: 'Login Credentials',
            html: `<h3>Welcome, ${Fname} ${Lname}!</h3>
             <p>Your account has been successfully created.</p>
             <p><strong>Login Details:</strong></p>
             <ul>
               <li><strong>User ID:</strong> ${dataset.id}</li>
               <li><strong>Email:</strong> ${dataset.email}</li>
               <li><strong>Password:</strong> ${dataset.password}</li>
             </ul>
             <p>Use these credentials to log in to the system.</p>`,
        });
        logger_1.logger.info(`registerUser: Email sent: ${isEmailSent}`);
        // Prepare address
        const address_line = `${addLine1} ${addLine2}`;
        const prepareData = `${address_line}, ${city}, ${state}, ${country}, ${postal_code}`;
        logger_1.logger.debug(`registerUser: Geocoding address: ${prepareData}`);
        // Get latitude & longitude
        const location = await (0, getLocation_1.getLatLng)(prepareData);
        if (!location) {
            logger_1.logger.warn("registerUser: Could not fetch latitude/longitude for address");
            return res.status(400).json({ message: "Invalid address, cannot geocode" });
        }
        // Insert address in DB
        const datasetAddress = await (0, users_1.insertByColNameAndValueAndTablename)('addresses', ['user_id', 'address_line', 'city', 'state', 'country', 'postal_code', 'latitude', 'longitude'], [dataset.id, address_line, city, state, country, postal_code, location.lat, location.lng]);
        logger_1.logger.info(`registerUser: Address inserted for user ID ${dataset.id}`);
        // Update credential sent flag
        if (isEmailSent && datasetAddress) {
            await dbconn_1.default.query(`UPDATE usersdata SET iscredentialssend = $2 WHERE id=$1;`, [dataset.id, true]);
            logger_1.logger.info(`registerUser: Credentials sent flag updated for user ID ${dataset.id}`);
            return res.status(201).json({
                email: dataset.email,
                username: dataset.username,
                message: "Please check your email for login credentials",
            });
        }
        return res.status(500).json({ message: "Unexpected error during registration" });
    }
    catch (err) {
        logger_1.logger.error("registerUser: Unexpected error", err);
        return res.status(500).json({
            message: "Something went wrong during signup",
            error: err,
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Missing credentials. Please provide email and password.",
        });
    }
    try {
        const result = await UserModel.checkCredentails(email, password);
        console.log(result);
        if (result.success && result.user) {
            const accessTokenKey = await generatedAccessToken(result.user.id);
            // console.log(accessTokenKey);
            const option = {
                httpOnly: true,
                secure: true
            };
            return res.status(200).cookie("access-token", accessTokenKey, option).json({
                message: "Login successfullllllll",
                user: {
                    loginUser: result.user.id,
                    accessToken: accessTokenKey,
                }
            });
        }
        return res.status(401).json({
            message: "Invalid email or password. Please try again.",
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Something went wrong during login",
            error: err,
        });
    }
};
exports.loginUser = loginUser;
const logout = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        res.status(400).json({ message: 'No token provided' });
        return;
    }
    try {
        const option = {
            httpOnly: true, // learn from youtube so that no third user can change or modified the cookies
            secure: true
        };
        await dbconn_1.default.query('DELETE FROM sessions WHERE access_token = $1', [token]);
        res.clearCookie('access-token', option);
        res.status(200).json({
            message: 'Logged out successfully'
        });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error during logout'
        });
        return;
    }
};
exports.logout = logout;
//# sourceMappingURL=userController.js.map