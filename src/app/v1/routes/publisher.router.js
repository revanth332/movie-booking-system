import express from "express";
import {
  addMovie,
  registerMovie,
} from "../controllers/publisher.controller.js";

const router = express.Router();

router.route("/addMovie").post(addMovie);

router.route("/registerMovie").post(registerMovie);

export default router;
