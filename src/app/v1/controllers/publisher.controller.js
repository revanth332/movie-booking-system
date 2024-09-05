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
      role:"publisher"
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

  try {
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(theaterData.password, salt);
    console.log(theaterData)
    const response = await Publisher.registerTheater({
      ...theaterData,
      password: hashedPassword,
    });
    

    const token = sign({ userId: response.data.theaterId }, config.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.status(response.status).send({theaterId:response.data.theaterId,theaterName:response.data.theaterName,token,role:"publisher"});
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("err");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the Theater",err})
  }
}

export async function addMovie(req, res) {
  const movieData = req.body;
  try {
    const response = await Publisher.addMovie(movieData);
    return res.status(200).send(response.msg);
  } catch (err) {
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
  console.log(theaterId)
  try {
    const response = await Publisher.getPublishedMovies(theaterId);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching published movies:", err);
    res.status(500).send("Failed to fetch movies"); 
  }
}


export async function cancelPublishedMovie(req, res) {
  const theaterMovieTimeId = req.query.theaterMovieTimeId;
  const date = req.query.date;
  console.log("theaterMovieTimeId")
  try {
    console.log("kl")
    const response = await Publisher.cancelPublishedMovie(theaterMovieTimeId,date);
    res.status(200).json(response.msg);
  } catch (err) {
    console.error("Error fetching published movies:", err);
    res.status(500).send("Failed to fetch movies");
  }
}


