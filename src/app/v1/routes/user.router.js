import express from 'express'
const router = express.Router();
import {bookMovie,cancelBooking,getBookings,getMovies,getShowTimes,getTheaters,submitFeedback,getTheaterTimeMovieId,getSeats } from '../controllers/user.controller.js';

router.route('/getMovies').get(getMovies)

router.route("/bookMovie").post(bookMovie);

router.route("/cancelBooking").post(cancelBooking);

router.route("/getShowTimes").get(getShowTimes);

router.route("/getTheaters").get(getTheaters);

router.route("/getBookings").get(getBookings)

router.route("/submitFeedback").post(submitFeedback);

router.route("/getTheaterTimeMovieId").get(getTheaterTimeMovieId);

router.route("/getSeats").get(getSeats);

export default router;