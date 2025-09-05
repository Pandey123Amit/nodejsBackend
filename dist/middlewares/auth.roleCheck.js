"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = checkRole;
function checkRole(allowedRoles) {
    return (req, res, next) => {
        var _a;
        const userRoles = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.roles) || [];
        if (!allowedRoles.some(role => userRoles.includes(role))) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }
        next();
    };
}
//# sourceMappingURL=auth.roleCheck.js.map