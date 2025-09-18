import express from 'express';
import { verifyToken } from '../middlewares/auth.middelware';
import { checkRole } from '../middlewares/auth.rolecheck';
import { Role } from '../constant';
import { checkPermission } from '../middlewares/auth.middelwarePermission';
import { addDish, createRestaurant, getAllDishesByRestaurants } from '../controllers/restaurantsController';
import { getAllRestaurants } from '../controllers/userController';


const router = express.Router();

router.post('/create-restaurant',checkPermission("CREATE_RESTAURANT"),createRestaurant)


router.get('/restaurant', verifyToken,getAllRestaurants);




export default router;
