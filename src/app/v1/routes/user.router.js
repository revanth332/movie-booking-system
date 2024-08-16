import express from 'express'
import { registerUser,loginUser,registerTheater } from '../controllers/user.controller.js';

const router = express.Router();

router.route('/registerUser').post(registerUser);

router.route('/registerTheater').post(registerTheater);

router.route('/login').post(loginUser);


export default router;