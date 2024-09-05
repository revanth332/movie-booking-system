import express from 'express'
import { registerUser,loginUser} from '../controllers/user.controller.js';
import { loginPublisher,registerTheater } from '../controllers/publisher.controller.js';

const router = express.Router();

router.route('/registerUser').post(registerUser);

router.route('/registerTheater').post(registerTheater);

router.route('/loginUser').post(loginUser);

router.route('/loginPublisher').post(loginPublisher);

export default router;