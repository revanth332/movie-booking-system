import express from 'express'
import { addMovie } from '../controllers/publisher.controller.js';

const router = express.Router();

router.route('/addMovie').post(addMovie);

export default router;