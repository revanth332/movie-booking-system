import express from 'express'
const router = express.Router();
import { addMovie,bookMovie,cancelMovie,getMovies } from '../controllers/movie.controller.js';

router.route('/getMovies').get(getMovies)

router.route('/addMovie').post(addMovie);

router.route("/book").post(bookMovie);

router.route("/cancel").post(cancelMovie);


export default router;