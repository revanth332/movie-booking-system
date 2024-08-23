import express from "express";
import {
  addMovie,
  registerMovie,
  getPublishedMovies
} from "../controllers/publisher.controller.js";

const router = express.Router();

router.route("/addMovie").post(addMovie);

router.route("/registerMovie").post(registerMovie);

router.route("/getPublishedMoviess").get(getPublishedMovies);

export default router;
