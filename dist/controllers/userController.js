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
exports.getAllSubAdmins = exports.getAllRestaurants = exports.registerSubAdmin = exports.logout = exports.loginUser = exports.registerUser = void 0;
const UserModel = __importStar(require("../model/userModel"));
const users_1 = require("../utils/users");
const emailSend_1 = require("../utils/emailSend");
const dbconn_1 = __importDefault(require("../db/dbconn"));
const getLocation_1 = require("../utils/getLocation");
const logger_1 = require("../utils/logger");
const constant_1 = require("../constant");
const RestaurantsModel_1 = require("../model/RestaurantsModel");
const distanceFormula_1 = require("../utils/distanceFormula");
const generatedAccessToken = async (user) => {
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenKey) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
    }
    const accessToken = (0, users_1.tokenGenerate)(accessTokenKey);
    const dataset = await (0, users_1.insertByColNameAndValueAndTablename)('sessions', ['session_token', 'user_id'], [accessToken, user]);
    if (!dataset) {
        throw new Error("Failed to insert session token.");
    }
    return accessToken;
};
const registerUser = async (req, res, next) => {
    const { Fname, Lname, phonenumber, email, addLine1, addLine2, city, state, country, postal_code, usertype } = req.body;
    if (!(usertype === constant_1.Role.Admin || usertype === constant_1.Role.SubAdmin || usertype === constant_1.Role.User)) {
        res.status(400).json({ message: "Usertype not match" });
        return;
    }
    try {
        if (!email) {
            logger_1.logger.debug("registerUser: Email is required");
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const isUserExist = await (0, users_1.userExist)(email);
        if (isUserExist) {
            logger_1.logger.debug("registerUser: User with this email already exists");
            res.status(400).json({ message: "User with this email already exists" });
            return;
        }
        const password = (0, users_1.genratedpassword)();
        const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password, usertype);
        const check = await (0, users_1.insertByColNameAndValueAndTablename)('user_roles', ['user_id', 'role'], [dataset.id, usertype]);
        let isEmailSent = false;
        if (dataset) {
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
        }
        const address_line = addLine1 + " " + addLine2;
        const prepareData = `${address_line}, ${city}, ${state}, ${country}, ${postal_code}`;
        const location = await (0, getLocation_1.getLatLng)(prepareData);
        if (!location) {
            logger_1.logger.warn("registerUser: location not fetched");
            res.status(400).json({ message: "Cannot fetch latitude/longitude for the given address" });
            return;
        }
        const datasetAddress = await (0, users_1.insertByColNameAndValueAndTablename)('addresses', ['user_id', 'address_line', 'city', 'state', 'country', 'postal_code', 'latitude', 'longitude'], [dataset.id, address_line, city, state, country, postal_code, location.lat, location.lng]);
        if (isEmailSent && datasetAddress) {
            await dbconn_1.default.query(`UPDATE usersdata SET iscredentialssend = $2 WHERE id=$1;`, [dataset.id, true]);
            logger_1.logger.info(`registerUser: Email sent to ${dataset.email}`);
            res.status(201).json({
                email: dataset.email,
                username: dataset.username,
                message: "Please check Email for login Credentials"
            });
            return;
        }
    }
    catch (err) {
        logger_1.logger.error("registerUser:", err);
        res.status(500).json({ message: "Something went wrong during signup", error: err });
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
            return res.status(200).cookie("token", accessTokenKey, option).json({
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
    const token = authHeader;
    if (!token) {
        res.status(400).json({ message: 'No token provided' });
        return;
    }
    try {
        const option = {
            httpOnly: true, // learn from youtube so that no third user can change or modified the cookies
            secure: true
        };
        await dbconn_1.default.query('DELETE FROM sessions WHERE session_token = $1', [token]);
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
const registerSubAdmin = async (req, res, next) => {
    const { Fname, Lname, email, phonenumber, addLine1, addLine2, city, state, country, postal_code, permission } = req.body;
    let isEmailSent = false;
    try {
        if (!email) {
            logger_1.logger.debug("registerSubAdmin: Email is required");
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const isUserExist = await (0, users_1.userExist)(email);
        if (isUserExist) {
            logger_1.logger.debug("registerSubAdmin: User with this email already exists");
            res.status(400).json({ message: "User with this email already exists" });
            return;
        }
        const password = (0, users_1.genratedpassword)();
        const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password, permission.length > 0 ? constant_1.Role.SubAdmin : constant_1.Role.User);
        const roleId = await (0, users_1.insertByColNameAndValueAndTablename)('user_roles', ['user_id', 'role'], [dataset.id, constant_1.Role.SubAdmin]);
        for (const value of permission) {
            await (0, users_1.insertByColNameAndValueAndTablename)('role_permissions', ['role_id', 'permission_id'], [roleId.id, value]);
        }
        isEmailSent = await (0, emailSend_1.sendEmail)({
            from: process.env.SENDER_EMAIL,
            to: dataset.email,
            subject: 'Sub-admin Account Created',
            html: `<h3>Welcome, ${Fname} ${Lname}!</h3>
                   <p>Your sub-admin account has been created.</p>
                   <p>Email: ${dataset.email}</p>
                   <p>Password: ${password}</p>`
        });
        if (isEmailSent) {
            await dbconn_1.default.query(`UPDATE usersdata SET iscredentialssend = $2 WHERE id=$1;`, [dataset.id, true]);
            logger_1.logger.info(`registerUser: Email sent to ${dataset.email}`);
            res.status(201).json({
                email: dataset.email,
                username: dataset.username,
                message: "Please check Email for login Credentials"
            });
            return;
        }
        if (addLine1 || addLine2) {
            const addressLine = `${addLine1 || ''} ${addLine2 || ''}`.trim();
            const fullAddress = `${addressLine}, ${city}, ${state}, ${country}, ${postal_code}`;
            const location = await (0, getLocation_1.getLatLng)(fullAddress);
            if (location) {
                await (0, users_1.insertByColNameAndValueAndTablename)('addresses', ['user_id', 'address_line', 'city', 'state', 'country', 'postal_code', 'latitude', 'longitude'], [dataset.id, addressLine, city, state, country, postal_code, location.lat, location.lng]);
            }
            else {
                logger_1.logger.warn(`registerSubAdmin: Could not fetch location for address of user ${dataset.id}`);
            }
        }
        logger_1.logger.info(`registerSubAdmin: Sub-admin created ${dataset.email}`);
        res.status(201).json({ message: "Sub-admin registered successfully", email: dataset.email });
    }
    catch (err) {
        logger_1.logger.error("registerSubAdmin error:", err);
        res.status(500).json({ message: "Something went wrong", error: err });
    }
};
exports.registerSubAdmin = registerSubAdmin;
const getAllRestaurants = async (req, res) => {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const rolecheck = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.roles[0];
    try {
        const dataset = await RestaurantsModel_1.RestaurantModel.getAll();
        const userinfo = await UserModel.findById(userId);
        if (!userinfo) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (rolecheck === constant_1.Role.User) {
            const userLat = userinfo.latitude;
            const userLng = userinfo.longitude;
            const restaurantsWithDistance = dataset.map((restaurant) => (Object.assign(Object.assign({}, restaurant), { distance_km: (0, distanceFormula_1.haversineformula)(userLat, userLng, Number(restaurant.latitude), Number(restaurant.longitude)).toFixed(2) })));
            res.status(200).json({
                success: true,
                message: "All Restaurants with distance from user location",
                data: {
                    user: userinfo,
                    restaurants: restaurantsWithDistance
                }
            });
            return;
        }
        else {
            res.status(200).json({
                success: true,
                message: "All Restaurants",
                data: {
                    user: userinfo,
                    restaurants: dataset
                }
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching data",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.getAllRestaurants = getAllRestaurants;
const getAllSubAdmins = async (req, res) => {
    try {
        const result = await UserModel.getAllSubAdmin();
        res.status(200).json({
            success: true,
            subAdmins: result
        });
    }
    catch (error) {
        console.error('getAllSubAdmins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sub-admins',
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.getAllSubAdmins = getAllSubAdmins;
//# sourceMappingURL=userController.js.map