"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers["authorization"];
            const token = authHeader;
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            // get user session from DB
            const sessionResult = await dbconn_1.default.query(`SELECT user_id FROM sessions WHERE session_token = $1`, [token]);
            const session = sessionResult.rows[0];
            if (!session) {
                return res.status(403).json({ message: "Invalid session" });
            }
            const userId = session.user_id;
            // fetch roles for user
            const roleResult = await dbconn_1.default.query(`SELECT id FROM user_roles WHERE user_id = $1`, [userId]);
            if (roleResult.rowCount === 0) {
                return res.status(403).json({ message: "User has no roles assigned" });
            }
            const roleIds = roleResult.rows.map(r => r.id);
            // fetch permissions for those roles
            const permResult = await dbconn_1.default.query(`SELECT p.name 
                 FROM role_permissions rp
                 JOIN permissions p ON rp.permission_id = p.id
                 WHERE rp.role_id = ANY($1::int[])`, [roleIds]);
            const userPermissions = permResult.rows.map(p => p.name);
            if (!userPermissions.includes(permission)) {
                return res.status(403).json({ message: "Permission denied" });
            }
            // attach user info to request (optional)
            req.user = { id: userId, permissions: userPermissions };
            next();
        }
        catch (error) {
            console.error("Permission check error:", error);
            res.status(500).json({ message: "Server error during permission check" });
        }
    };
};
exports.checkPermission = checkPermission;
//# sourceMappingURL=auth.middelwarePermission.js.map