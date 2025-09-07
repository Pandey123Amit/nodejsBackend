"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubAdmin = exports.findById = exports.checkCredentails = exports.register = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const constant_1 = require("../constant");
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
        const query = `
      SELECT u.id, u.email, a.id AS address_id,a.latitude,a.longitude
      FROM usersdata u
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE u.id = $1;
    `;
        const queryValue = await dbconn_1.default.query(query, [userid]);
        if (queryValue.rows.length === 0) {
            throw new Error("User not found");
        }
        const dataset = queryValue.rows[0];
        return dataset;
    }
    catch (error) {
        throw new Error("Something went wrong in findById method");
    }
};
exports.findById = findById;
const getAllSubAdmin = async () => {
    try {
        const result = await dbconn_1.default.query(`
            SELECT
                u.id,
                CONCAT(u.fname, ' ', u.lname) AS name,
                u.phonenumber,
                u.usertype,
                STRING_AGG(p.name, ', ') AS role_assigned
            FROM usersdata u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN role_permissions rp ON ur.id = rp.role_id
            LEFT JOIN permissions p ON p.id = rp.permission_id
            WHERE ur.role = $1
            GROUP BY u.id, u.fname, u.lname, u.phonenumber, u.usertype;
        `, [constant_1.Role.SubAdmin]);
        if (result.rows.length === 0) {
            throw new Error("No sub-admins found");
        }
        return result.rows;
    }
    catch (error) {
        console.error("getAllSubAdmin error:", error);
        throw new Error("Something went wrong while fetching sub-admins");
    }
};
exports.getAllSubAdmin = getAllSubAdmin;
//# sourceMappingURL=userModel.js.map