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
        if(response.status === 200) res.status(response.status).send(response.data);
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

export async function cancelMovie(req,res){
    const movieData = req.body;
    try{
        const response = await Movie.addMovie(movieData);
        if(response.status === 200) res.status(response.status).send("Movie added succesfully")
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to add the movie",err})
    }
}