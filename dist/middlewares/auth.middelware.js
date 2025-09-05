"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader;
    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;
    }
    try {
        const sessionResult = await dbconn_1.default.query('SELECT * FROM sessions WHERE session_token = $1', [token]);
        const session = sessionResult.rows[0];
        if (!session) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        // Fetch user info along with roles
        const userResult = await dbconn_1.default.query(`SELECT u.id, u.email, array_agg(ur.role) AS roles
             FROM usersdata u
             JOIN user_roles ur ON u.id = ur.user_id
             WHERE u.id = $1
             GROUP BY u.id`, [session.user_id]);
        const user = userResult.rows[0];
        if (!user) {
            res.status(403).json({ message: 'User not found' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            roles: user.roles
        };
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during auth' });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.middelware.js.map