
import {StatusCodes} from 'http-status-codes';
import User from '../models/user.model.js';
import pkg from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../../../config.js';

const { sign } = pkg;

export async function registerUser(req,res){

    const userData = req.body;
    console.log(userData)
    try{
        const salt = await bcrypt.genSalt(5)
        const hashedPassword = await bcrypt.hash(userData.password,salt);
        const response = await User.registerUser({...userData,password:hashedPassword});

        return res.status(response.status).send(response.msg);
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the user",err})
    }
}

export async function loginUser(req,res){
    const userData = req.body;
    try{
        const response = await User.loginUser(userData);
        console.log(response)
        const token = sign({ userId:response.userId }, config.SECRET_KEY, {
            expiresIn: "1d"
        });
        return res.status(response.status).send({msg:response.msg,token});
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to log the user",err})
    }
}

export async function getMovies(req,res){
    try{
        const response = await User.getMovies();
        res.status(response.status).send({movies:response.data});
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to fetch the movies",err})
    }
}

export async function bookMovie(req,res){
    const bookingData = req.body;
    try{
        const response = await User.bookMovie(bookingData);
        res.status(response.status).send("Booked succesfully")
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to book the movie",err})
    }
}

export async function cancelBooking(req,res){
    const bookingData = req.body;
    try{
        const response = await User.cancelBooking(bookingData);
        res.status(response.status).send("Movie cancelled succesfully")
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to cancel the movie",err})
    }
}

export async function getShowTimes(req,res){
    const theaterMovieId = req.query.theaterMovieId;
    try{
        const response = await User.getShowTimes(theaterMovieId);
        res.status(response.status).send({showTimes:response.data})
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the show timings",err})
    }
}

export async function getTheaters(req,res){
    const movieId = req.query.movieId;
    try{
        const response = await User.getTheaters(movieId);
        res.status(response.status).send({theaters:response.data})
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
    }
}

export async function submitFeedback(req,res){
    const feedbackData = req.body;
    try{
        const response = await User.submitFeedback(feedbackData);
        res.status(response.status).send(response.msg)
    }
    catch(err){
        if (err.status) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
        }
        // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
    }
}