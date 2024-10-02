import express from "express";
import {
  addMovie,
  getPublishedMovies,
  cancelPublishedMovie
} from "../controllers/publisher.controller.js";

const router = express.Router();

router.route("/addMovie").post(addMovie);

router.route("/cancelPublishedMovie").delete(cancelPublishedMovie);

router.route("/getPublishedMovies").get(getPublishedMovies);


export default router;
