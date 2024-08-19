import logger from "../../../../logger.js";
import {StatusCodes} from 'http-status-codes';
import Movie from "../models/movie.model.js";

export async function addMovie(req,res){
    const movieData = req.body;
    try{
        const response = await Movie.addMovie(movieData);
        if(response.status === 200) res.status(response.status).send("Movie added succesfully")
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to add the movie",err})
    }
}

export async function getMovies(req,res){
    try{
        const response = await Movie.getMovies();
        if(response.status === 200) res.status(response.status).send({movies:response.data});
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to fetch the movies",err})
    }
}

export async function bookMovie(req,res){
    const bookingData = req.body;
    try{
        const response = await Movie.bookMovie(bookingData);
        if(response.status === 200) res.status(response.status).send("Booked succesfully")
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to book the movie",err})
    }
}

export async function cancelBooking(req,res){
    const bookingData = req.body;
    try{
        const response = await Movie.cancelBooking(bookingData);
        if(response.status === 200) res.status(response.status).send("Movie cancelled succesfully")
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to cancel the movie",err})
    }
}

export async function getShowTimes(req,res){
    const theaterMovieId = req.query.theaterMovieId;
    try{
        const response = await Movie.getShowTimes(theaterMovieId);
        if(response.status === 200) res.status(response.status).send({showTimes:response.data})
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the show timings",err})
    }
}

export async function getTheaters(req,res){
    const movieId = req.query.movieId;
    try{
        const response = await Movie.getTheaters(movieId);
        if(response.status === 200) res.status(response.status).send({theaters:response.data})
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to get the theaters",err})
    }
}