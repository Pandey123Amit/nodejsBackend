import express from 'express';
import { checkPermission } from '../middlewares/auth.middelwarePermission';
import { addDish, deleteDish, getAllDishesByRestaurants, updateDish } from '../controllers/restaurantsController';
import { checkRole } from '../middlewares/auth.rolecheck';
import { Role } from '../constant';
import { verifyToken } from '../middlewares/auth.middelware';



const router = express.Router();

router.post('/:restaurantId/add',checkPermission("CREATE_DISH"),addDish)
router.delete('/:dishId', checkPermission("DELETE_DISH"), deleteDish);
router.put('/:dishId', checkPermission("UPDATE_DISH"), updateDish);
router.get('/dish',verifyToken,getAllDishesByRestaurants)




export default router;
