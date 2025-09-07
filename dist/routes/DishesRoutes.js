"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middelwarePermission_1 = require("../middlewares/auth.middelwarePermission");
const RestaurantsControllers_1 = require("../controllers/RestaurantsControllers");
const router = express_1.default.Router();
router.post('/:restaurantId/add', (0, auth_middelwarePermission_1.checkPermission)("CREATE_DISH"), RestaurantsControllers_1.addDish);
exports.default = router;
//# sourceMappingURL=DishesRoutes.js.map