import { Request, Response, NextFunction } from "express";
import pool from "../db/dbconn";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        permissions: string[];
    };
}

export const checkPermission = (permission: string):any => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers["authorization"];
            const token = authHeader as string;

            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // get user session from DB
            const sessionResult = await pool.query(
                `SELECT user_id FROM sessions WHERE session_token = $1`,
                [token]
            );

            const session = sessionResult.rows[0];
            if (!session) {
                return res.status(403).json({ message: "Invalid session" });
            }

            const userId = session.user_id;

            // fetch roles for user
            const roleResult = await pool.query(
                `SELECT id FROM user_roles WHERE user_id = $1`,
                [userId]
            );

            if (roleResult.rowCount === 0) {
                return res.status(403).json({ message: "User has no roles assigned" });
            }

            const roleIds = roleResult.rows.map(r => r.id);

            // fetch permissions for those roles
            const permResult = await pool.query(
                `SELECT p.name 
                 FROM role_permissions rp
                 JOIN permissions p ON rp.permission_id = p.id
                 WHERE rp.role_id = ANY($1::int[])`,
                [roleIds]
            );

            const userPermissions = permResult.rows.map(p => p.name);

            if (!userPermissions.includes(permission)) {
                return res.status(403).json({ message: "Permission denied" });
            }

            // attach user info to request (optional)
            (req as any).user = { id: userId, permissions: userPermissions };

            next();
        } catch (error) {
            console.error("Permission check error:", error);
            res.status(500).json({ message: "Server error during permission check" });
        }
    };
};
