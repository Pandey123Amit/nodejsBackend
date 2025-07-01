"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExist = exports.genratedpassword = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const dbconn_1 = __importDefault(require("../db/dbconn"));
dotenv_1.default.config();
const genratedpassword = () => {
    var _a;
    const value = 'Remote@';
    const rawValue = (_a = process.env.RANDOM_VALUE) !== null && _a !== void 0 ? _a : "12";
    const digit = Math.floor(Math.random() * parseInt(rawValue) * 100);
    const password = value + digit;
    return password;
};
exports.genratedpassword = genratedpassword;
const userExist = async (email) => {
    if (!email)
        return false;
    try {
        const query = `select email from usersdata where email = $1`;
        const data = await dbconn_1.default.query(query, [email]);
        const dataset = data.rows[0];
        if (dataset && dataset.email) {
            return false;
        }
        else {
            return true;
        }
    }
    catch (error) {
        console.log("Error in userexit", error);
        return true;
    }
};
exports.userExist = userExist;
//# sourceMappingURL=users.js.map