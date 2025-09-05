import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        roles: string[];
    }
}

export const checkRole = (roles: string[]) : any=> {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest; 
        if (!authReq.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const userRoles = authReq.user.roles || [];
        if (!roles.some((r: string) => userRoles.includes(r))) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    }
}
