import express from 'express';
import { checkPermission } from '../middlewares/auth.middelwarePermission';
import { addDish } from '../controllers/RestaurantsControllers';



const router = express.Router();

router.post('/:restaurantId/add',checkPermission("CREATE_DISH"),addDish)

export default router;
