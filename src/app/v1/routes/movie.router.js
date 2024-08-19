import express from 'express'
const router = express.Router();
import { addMovie,bookMovie,cancelBooking,getMovies,getShowTimes } from '../controllers/movie.controller.js';

router.route('/getMovies').get(getMovies)

router.route('/addMovie').post(addMovie);

router.route("/bookMovie").post(bookMovie);

router.route("/cancelBooking").post(cancelBooking);

router.route("/getShowTimes").get(getShowTimes);

export default router;