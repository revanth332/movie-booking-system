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
    const token = await pkg.sign({ userId: response.theaterId }, config.SECRET_KEY, {
      expiresIn: "1d",
    });
    console.log(token)
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
    // console.log(theaterData)
    const response = await Publisher.registerTheater({
      ...theaterData,
      password: hashedPassword,
    });

    const token = await pkg.sign({ userId: response.data.theaterId }, config.SECRET_KEY, {
      expiresIn: "1d",
    });
    console.log(token)

    return res.status(response.status).send({theaterId:response.data.theaterId,theaterName:response.data.theaterName,token,role:"publisher"});
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
    return res.status(200).send(response.msg);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).send(err.message);
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occured");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to add the movie",err})
  }
}


export async function getPublishedMovies(req, res) {
  const theaterId = req.query.theaterId;
  try {
    if(theaterId === null || theaterId === undefined || theaterId === "") throw {status:StatusCodes.BAD_REQUEST,message:"TheaterId not specified"}
    const response = await Publisher.getPublishedMovies(theaterId);
    res.status(200).send(response.data);
  } catch (err) {
    // console.error("Error fetching published movies:", err);
    if (err.status) {
      return res.status(err.status).send(err.message);
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occured");
    }
  } 
}


export async function cancelPublishedMovie(req, res) {
  const theaterMovieTimeId = req.query.theaterMovieTimeId;
  const theaterMovieId = req.query.theaterMovieId;
  const movieId = req.query.movieId;
  const date = req.query.date;
  console.log("theaterMovieTimeId fg")
  const movieData = req.query;
  try {
    for(let key in movieData){
      if(movieData[key] === null || movieData[key] === undefined || movieData[key] === ""){
        console.log(key)
        throw {status:StatusCodes.BAD_REQUEST,message:`${key} is empty`}
        
      }
    }
    const response = await Publisher.cancelPublishedMovie(theaterMovieTimeId,date,theaterMovieId,movieId);
    res.status(200).send(response.msg);
  } catch (err) {
    // console.error("Error fetching published movies:", err);
    if (err.status) {
      return res.status(err.status).send(err.message);
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occured");
    }
  }
}


