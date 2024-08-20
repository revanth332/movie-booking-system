import express from 'express'
const router = express.Router();
import {bookMovie,cancelBooking,getMovies,getShowTimes,getTheaters,getBookings,submitFeedback } from '../controllers/user.controller.js';

router.route('/getMovies').get(getMovies)

router.route("/bookMovie").post(bookMovie);

router.route("/cancelBooking").post(cancelBooking);

router.route("/getShowTimes").get(getShowTimes);

router.route("/getTheaters").get(getTheaters);

router.route("/submitFeedback").post(submitFeedback);

export default router;