import { Request, Response, NextFunction } from "express";
import pool from "../db/dbconn";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        permissions: string[];
        role: string | null;
    };
}

export const checkPermission = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = req.headers["authorization"] as string;

            if (!token) {
                 res.status(401).json({ message: "Unauthorized: No token provided" });
                 return
            }

            // Fetch session
            const sessionResult = await pool.query(
                `SELECT user_id FROM sessions WHERE session_token = $1`,
                [token]
            );
            const session = sessionResult.rows[0];

            if (!session) {
                 res.status(403).json({ message: "Invalid session" });
                 return
            }

            const userId = session.user_id;

            // Fetch user roles
            const roleResult = await pool.query(
                `SELECT id, role FROM user_roles WHERE user_id = $1`,
                [userId]
            );6

            if (roleResult.rowCount === 0) {
                 res.status(403).json({ message: "User has no roles assigned" });
                 return
            }

            const roleIds = roleResult.rows.map(r => r.id);
            const userRole = roleResult.rows[0].role;

            const permResult = await pool.query(
                `SELECT p.name FROM role_permissions rp
                 JOIN permissions p ON rp.permission_id = p.id
                 WHERE rp.role_id = ANY($1::int[])`,
                [roleIds]
            );

            const userPermissions = permResult.rows.map(p => p.name);

            if (!userPermissions.includes(requiredPermission)) {
                 res.status(403).json({ message: "Permission denied" });
                 return
            }

            // Attach user info to request
            (req as AuthenticatedRequest).user = {
                id: userId,
                permissions: userPermissions,
                role: userRole || null
            };

            next();
        } catch (error) {
            console.error("Permission check error:", error);
            res.status(500).json({ message: "Server error during permission check" });
            return
        }
    };
};
