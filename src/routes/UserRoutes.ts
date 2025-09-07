import express from 'express';
import { registerUser, logout, loginUser, registerSubAdmin,getAllRestaurants, getAllSubAdmins,  } from '../controllers/userController';
import { verifyToken } from '../middlewares/auth.middelware';
import { checkRole } from '../middlewares/auth.rolecheck';
import { Role } from '../constant';
import { checkPermission } from '../middlewares/auth.middelwarePermission';


const router = express.Router();

router.post('/signup', registerUser);
router.post('/logout', verifyToken, logout);
router.post('/login', loginUser);
router.get('/get-sub-admin',verifyToken,checkRole([Role.Admin]),getAllSubAdmins );

router.post('/sub-admin', verifyToken,checkRole([Role.Admin]), registerSubAdmin);
router.post('/sub-admin', verifyToken,checkRole([Role.Admin,Role.SubAdmin]), registerSubAdmin);

router.get('/restaurant', verifyToken,getAllRestaurants);


export default router;



