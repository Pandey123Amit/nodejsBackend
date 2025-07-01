"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertByColNameAndValueAndTablename = exports.tokenGenerate = exports.userExist = exports.genratedpassword = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const dbconn_1 = __importDefault(require("../db/dbconn"));
const node_crypto_1 = require("node:crypto");
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
const tokenGenerate = (key) => {
    return Buffer.from((0, node_crypto_1.randomBytes)(key.length)).toString('hex'); //stackoverflow
};
exports.tokenGenerate = tokenGenerate;
const insertByColNameAndValueAndTablename = async (tableName, columnNames, values) => {
    if (columnNames.length !== values.length) {
        throw new Error("Column names and values count must match.");
    }
    const columns = columnNames.map(col => `"${col}"`).join(", ");
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`;
    try {
        const result = await dbconn_1.default.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.error("Insert failed:", error);
        throw error;
    }
};
exports.insertByColNameAndValueAndTablename = insertByColNameAndValueAndTablename;
//# sourceMappingURL=users.js.map