import express from 'express';
import { registerUser, logout, loginUser, registerSubAdmin } from '../controllers/userController';
import { verifyToken } from '../middlewares/auth.middelware';
import { checkRole } from '../middlewares/auth.rolecheck';
import { Role } from '../constant';


const router = express.Router();

router.post('/signup', registerUser);
router.post('/logout', verifyToken, logout);
router.post('/login', loginUser);
router.post('/sub-admin', verifyToken,checkRole([Role.Admin]), registerSubAdmin);

export default router;



