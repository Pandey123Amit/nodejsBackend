import express from 'express';
import { registerUser, logout, loginUser } from '../controllers/userController';
import { verifyToken } from '../middlewares/auth.middelware';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/logout', verifyToken, logout);
router.post('/login', loginUser);

export default router;
