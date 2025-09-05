"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = exports.checkCredentails = exports.register = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const register = async (Fname, Lname, email, phonenumber, password, usertype) => {
    const query = `INSERT INTO usersdata(Fname,Lname,username,phonenumber,email,password,usertype) 
                    values($1,$2,$3,$4,$5,$6,$7) RETURNING *;`;
    try {
        const dataset = await dbconn_1.default.query(query, [Fname, Lname, email.split('@')[0], phonenumber, email, password, usertype]);
        return dataset.rows[0];
    }
    catch (err) {
        console.log(`Error in Datainsert: ${err}`);
        throw new Error('Something worng in userModels');
    }
};
exports.register = register;
const checkCredentails = async (email, password) => {
    const queryString = `SELECT id, email, username, password FROM usersdata WHERE email = $1;`;
    try {
        const queryValue = await dbconn_1.default.query(queryString, [email]);
        //console.log(email,password);
        const dataset = queryValue.rows[0];
        if (dataset && (dataset.username === email.split('@')[0] || dataset.email === email) && dataset.password === password) {
            //console.log("inside if check:",dataset);
            return { success: true, user: dataset };
        }
        return { success: false };
    }
    catch (error) {
        console.log(`Error in fetching: ${error}`);
        throw new Error('Something went wrong in checkCredentials');
    }
};
exports.checkCredentails = checkCredentails;
const findById = async (userid) => {
    try {
        const query = `select * from user where id = $1;`;
        const queryValue = await dbconn_1.default.query(query, [userid]);
        const dataset = queryValue.rows[0];
        return dataset;
    }
    catch (error) {
        throw new Error("SOmething wrong in FindByid Method");
    }
};
exports.findById = findById;
//# sourceMappingURL=userModel.js.map