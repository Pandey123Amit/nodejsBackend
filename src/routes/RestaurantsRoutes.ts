import express from 'express';
import { verifyToken } from '../middlewares/auth.middelware';
import { checkRole } from '../middlewares/auth.rolecheck';
import { Role } from '../constant';
import { checkPermission } from '../middlewares/auth.middelwarePermission';
import { createRestaurant } from '../controllers/RestaurantsControllers';


const router = express.Router();

router.post('/create-restaurant',checkPermission("CREATE_RESTAURANT"),createRestaurant)

export default router;
