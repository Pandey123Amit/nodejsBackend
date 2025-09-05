"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (roles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const userRoles = authReq.user.roles || [];
        if (!roles.some((r) => userRoles.includes(r))) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=auth.rolecheck.js.map