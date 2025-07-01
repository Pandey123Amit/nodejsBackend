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
const registerUser = async (req, res) => {
    const { Fname, Lname, phonenumber, email } = req.body;
    const isuserExist = await (0, users_1.userExist)(email);
    // console.log(isuserexit);
    try {
        if (email && isuserExist) {
            let isemail = false;
            const password = (0, users_1.genratedpassword)();
            const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password);
            if (dataset) {
                isemail = await (0, emailSend_1.sendEmail)({
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
            if (isemail) {
                console.log(dataset.id);
                await dbconn_1.default.query(`UPDATE usersdata SET isCredentailsSend = $2 where id=$1;`, [dataset.id, true]);
                res.json({
                    email: dataset.email,
                    username: dataset.username,
                    message: "Please check Email for login Credentials"
                });
                return;
            }
        }
    }
    catch (err) {
        res.json({
            meassage: "Something Went Wrong in signup",
            erros: err
        });
        return;
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
            error: err instanceof Error ? err.message : err,
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
            httpOnly: true,
            secure: true
        };
        await dbconn_1.default.query('DELETE FROM sessions WHERE access_token = $1', [token]);
        res.clearCookie('access-token', option);
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during logout' });
    }
};
exports.logout = logout;
//# sourceMappingURL=userController.js.map