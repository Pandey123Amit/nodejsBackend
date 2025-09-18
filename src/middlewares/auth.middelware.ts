import { Request, Response, NextFunction } from 'express';
import pool from '../db/dbconn';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        roles: string[];
    }
}

export const verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader as string | undefined;

    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;
    }

    try {
        const sessionResult = await pool.query(
            'SELECT * FROM sessions WHERE session_token = $1',
            [token]
        );

        const session = sessionResult.rows[0];

        if (!session) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        // Fetch user info along with roles
        const userResult = await pool.query(
            `SELECT u.id, u.email, array_agg(ur.role) AS roles
             FROM usersdata u
             JOIN user_roles ur ON u.id = ur.user_id
             WHERE u.id = $1
             GROUP BY u.id`,
            [session.user_id]
        );

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during auth' });
    }
};
