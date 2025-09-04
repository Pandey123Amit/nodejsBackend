"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_middelware_1 = require("../middlewares/auth.middelware");
const router = express_1.default.Router();
router.post('/signup', userController_1.registerUser);
router.post('/logout', auth_middelware_1.verifyToken, userController_1.logout);
router.post('/login', userController_1.loginUser);
exports.default = router;
//# sourceMappingURL=UserRoutes.js.map