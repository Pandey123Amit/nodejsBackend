import express from 'express';
import * as userController from '../controllers/userController';
import {verifyToken} from '../middlewares/auth.middelware'

const router = express.Router();

router.post('/signup', userController.registerUser);
router.route('/logout').post(verifyToken,userController.logout)
router.post('/login', userController.loginUser); 


export default router;


