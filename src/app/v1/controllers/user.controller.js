import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import pkg from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../../../config.js";

const { sign } = pkg;

export async function registerUser(req, res) {
  const userData = req.body;

  try {
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const response = await User.registerUser({
      ...userData,
      password: hashedPassword,
    });

    const token = await pkg.sign({ userId: response.data.userId }, config.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res
      .status(response.status)
      .send({
        userId: response.data.userId,
        userName: response.data.userName,
        token,
        role: "user",
      });
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the user",err})
  }
}

export async function loginUser(req, res) {
  const userData = req.body;
  try {
    const response = await User.loginUser(userData);
    const token = sign({ userId: response.userId }, config.SECRET_KEY, {
      expiresIn: "1d",
    });
    return res.status(response.status).send({
      msg: response.msg,
      token,
      userId: response.userId,
      userName: response.userName,
      role: response.role,
    });
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("An error occurred: " + err);
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to log the user",err})
  }
}


export async function getMovies(req, res) {
  try {
    const response = await User.getMovies();
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to fetch the movies",err})
  }
}

export async function bookMovie(req, res) {
  const bookingData = req.body;
  try {
    const response = await User.bookMovie(bookingData);
    res.status(response.status).send("Booked succesfully");
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to book the movie",err})
  }
}

export async function cancelBooking(req, res) {
  const bookingData = req.body;
  try {
    const response = await User.cancelBooking(bookingData);
    res.status(response.status).send("Movie cancelled succesfully");
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to cancel the movie",err})
  }
}

export async function getShowTimes(req, res) {
  const theaterMovieId = req.query.theaterMovieId;
  try {
    if(theaterMovieId === "" || theaterMovieId === undefined || theaterMovieId === null) throw {status:StatusCodes.BAD_REQUEST,message:"Invalid Id"}
    const response = await User.getShowTimes(theaterMovieId);
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the show timings",err})
  }
}

export async function getTheaters(req, res) {
  const movieId = req.query.movieId;
  try {
    if(movieId === null || movieId === undefined || movieId === "") throw {status : StatusCodes.BAD_REQUEST,message:"Movie Id not found"}
    const response = await User.getTheaters(movieId);
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
  }
}


export async function getBookings(req, res) {
  const userId = req.query.userId;
  try {
    if(userId === null || userId === undefined || userId === "") throw  {status : StatusCodes.BAD_REQUEST,message:"User Id not found"}

    const response = await User.getBookings(userId);
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
  }
}

export async function getSeats(req, res) {
  const theaterMovieTimeId = req.query.theaterMovieTimeId;
  try {
    if(theaterMovieTimeId === null || theaterMovieTimeId === undefined || theaterMovieTimeId === "") throw  {status : StatusCodes.BAD_REQUEST,message:"User Id not found"}

    const response = await User.getSeats(theaterMovieTimeId);
    res.status(response.status).send(response.data);
  } catch (err) {
    // console.log(err)
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
  }
}

export async function getTheaterTimeMovieId(req, res) {
  const theaterMovieId = req.query.theaterMovieId;
  const time = req.query.time;
  console.log(theaterMovieId, time);
  try {
    for(let key in req.query){
      if(req.query[key] === null || req.query[key] === undefined || req.query[key] === ""){
        throw {status : StatusCodes.BAD_REQUEST,message:`${key} not found` }
      }
    }
    const response = await User.getTheaterTimeMovieId(theaterMovieId, time);
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occured");
    }
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
  }
}

export async function getMoviesByGenre(req, res) {
  const genre = req.query.genre;
  console.log(genre);
  try {
    if(genre === null || genre === undefined || genre === "") throw  {status : StatusCodes.BAD_REQUEST,message:"Genre not found"}

    const response = await User.getMoviesByGenre(genre);
    return res.status(200).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occured");
    }
  }
}
