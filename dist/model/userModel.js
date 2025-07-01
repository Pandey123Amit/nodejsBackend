"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredentails = exports.register = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const register = async (Fname, Lname, email, phonenumber, password) => {
    const query = `INSERT INTO usersdata(Fname,Lname,username,phonenumber,email,password) 
                    values($1,$2,$3,$4,$5,$6) RETURNING *;`;
    try {
        const dataset = await dbconn_1.default.query(query, [Fname, Lname, email.split('@')[0], phonenumber, email, password]);
        return dataset.rows[0];
    }
    catch (err) {
        console.log(`Error in Datainsert: ${err}`);
        throw new Error('Something worng in userModels');
    }
};
exports.register = register;
const checkCredentails = async (email, password) => {
    const queryString = `Select id,email,username,password from usersdata where email = $1;`;
    try {
        const queryValue = await dbconn_1.default.query(queryString, [email]);
        const dataset = queryValue.rows[0];
        if (dataset && (dataset.username === email.split('@')[0] || dataset.email === email) && dataset.password === password) {
            return true;
        }
        return false;
    }
    catch (error) {
        console.log(`Error in fetching: ${error}`);
        throw new Error('Something worng in userModels');
    }
};
exports.checkCredentails = checkCredentails;
//# sourceMappingURL=userModel.js.map