"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;
    }
    try {
        const result = await dbconn_1.default.query('SELECT * FROM sessions WHERE access_token = $1', [token]);
        const session = result.rows[0];
        if (!session) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during auth' });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.middelware.js.map