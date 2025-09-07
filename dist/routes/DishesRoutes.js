"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middelwarePermission_1 = require("../middlewares/auth.middelwarePermission");
const RestaurantsControllers_1 = require("../controllers/RestaurantsControllers");
const auth_rolecheck_1 = require("../middlewares/auth.rolecheck");
const constant_1 = require("../constant");
const auth_middelware_1 = require("../middlewares/auth.middelware");
const router = express_1.default.Router();
router.post('/:restaurantId/add', (0, auth_middelwarePermission_1.checkPermission)("CREATE_DISH"), RestaurantsControllers_1.addDish);
router.delete('/:dishId', auth_middelware_1.verifyToken, (0, auth_rolecheck_1.checkRole)([constant_1.Role.Admin, constant_1.Role.SubAdmin]), (0, auth_middelwarePermission_1.checkPermission)("DELETE_DISH"), RestaurantsControllers_1.deleteDish);
exports.default = router;
//# sourceMappingURL=DishesRoutes.js.map