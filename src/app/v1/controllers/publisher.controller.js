
import {StatusCodes} from 'http-status-codes';
import Publisher from '../models/publisher.model.js';
import pkg from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../../../config.js';

const { sign } = pkg;


export async function loginPublisher(req,res){
    const userData = req.body;
    try{
        const response = await Publisher.loginPublisher(userData);
        console.log(response)
        const token = sign({ theaterId:response.theaterId }, config.SECRET_KEY, {
            expiresIn: "1d"
        });
        if(response.status === 200){
            return res.status(response.status).send({msg:response.msg,token});
        }
        else throw Error();
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to log the user",err})
    }
}

export async function registerTheater(req,res){
    // res.send("controller")
    const theaterData = req.body;
    // console.log(userData)
    try{
        const salt = await bcrypt.genSalt(5)
        const hashedPassword = await bcrypt.hash(theaterData.password,salt);
        const response = await Publisher.registerTheater({...theaterData,password:hashedPassword});

        return res.status(response.status).send(response.msg);
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the Theater",err})
    }
}

export async function addMovie(req,res){
    const movieData = req.body;
    try{
        const response = await Publisher.addMovie(movieData);
        if(response.status === 200) res.status(response.status).send("Movie added succesfully")
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to add the movie",err})
    }
}