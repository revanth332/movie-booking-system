import { StatusCodes } from "http-status-codes";
import Publisher from "../models/publisher.model.js";
import pkg from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../../../config.js";

const { sign } = pkg;

export async function loginPublisher(req, res) {
  const userData = req.body;
  try {
    const response = await Publisher.loginPublisher(userData);
    console.log(response);
    const token = sign({ userId: response.theaterId }, config.SECRET_KEY, {
      expiresIn: "1d",
    });
    return res.status(response.status).send({
      msg: response.msg,
      token,
      theaterName: response.theaterName,
      theaterId: response.theaterId,
    });
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to log the user",err})
  }
}

export async function registerTheater(req, res) {
  // res.send("controller")
  const theaterData = req.body;
  // console.log(userData)
  try {
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(theaterData.password, salt);
    const response = await Publisher.registerTheater({
      ...theaterData,
      password: hashedPassword,
    });

    return res.status(response.status).send(response.msg);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the Theater",err})
  }
}

export async function addMovie(req, res) {
  const movieData = req.body;
  try {
    const response = await Publisher.addMovie(movieData);
    console.log("jk");
    return res.status(200).send(response.msg);
  } catch (err) {
    console.log(err + "kkkkkkkkkkkk");
    if (err.status) {
      return res.status(err.status).send(err.message);
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to add the movie",err})
  }
}

export async function registerMovie(req, res) {
  const movieData = req.body;
  try {
    const response = await Publisher.registerMovie(movieData);
    res.status(response.status).send("Movie registered succesfully");
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to add the movie",err})
  }
}

// export async function getPublishedMovies(req, res) {
//   const theaterId = req.query.theaterId;
//   try {
//     const response = await Publisher.getPublishedMovies(theaterId);
//     console.log(response)
//     return res.send("response")
//   } catch (err) {
//     // if (err.status) {
//     //   res.status(err.status).send(err.message);
//     // } else {
//     //   res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
//     // }
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
//   }
// }

export async function getPublishedMovies(req, res) {
  const theaterId = req.query.theaterId;
  try {
    const response = await Publisher.getPublishedMoviess(theaterId);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching published movies:", err);
    res.status(500).send("Failed to fetch movies"); // Use 500 for internal server errors
  }
}
