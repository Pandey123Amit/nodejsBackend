import { Request, Response, NextFunction } from 'express';
import pool from '../db/dbconn';

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;
    }
    try {
        const result = await pool.query(
            'SELECT * FROM sessions WHERE access_token = $1',
            [token]
        );

        const session = result.rows[0];

        if (!session) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }

        next(); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during auth' });
    }
};

