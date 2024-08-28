import express from "express";
import {
  addMovie,
  registerMovie,
  getPublishedMovies,
  cancelPublishedMovie
} from "../controllers/publisher.controller.js";

const router = express.Router();

router.route("/addMovie").post(addMovie);

router.route("/cancelPublishedMovie").delete(cancelPublishedMovie);

router.route("/registerMovie").post(registerMovie);

router.route("/getPublishedMovies").get(getPublishedMovies);


export default router;
