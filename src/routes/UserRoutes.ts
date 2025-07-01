import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/signup', userController.registerUser);
router.post('/login', userController.loginUser); 


export default router;
