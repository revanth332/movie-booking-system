import express from 'express'
const router = express.Router();
import {bookMovie,cancelBooking,getBookings,getMovies,getShowTimes,getTheaters,submitFeedback,getTheaterTimeMovieId,getSeats,getMoviesByGenre } from '../controllers/user.controller.js';

router.route('/getMovies').get(getMovies)

router.route("/bookMovie").post(bookMovie);

router.route("/cancelBooking").post(cancelBooking);

router.route("/getShowTimes").get(getShowTimes);

router.route("/getTheaters").get(getTheaters);

router.route("/getBookings").get(getBookings)

router.route("/getTheaterTimeMovieId").get(getTheaterTimeMovieId);

router.route("/getSeats").get(getSeats);

router.route("/getMoviesByGenre").get(getMoviesByGenre);

export default router;