
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
        const response = await User.create({...userData,password:hashedPassword});

        return res.status(response.status).send(response.msg);
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the user",err})
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
    const userData = req.body;
    console.log(userData)
    try{
        const salt = await bcrypt.genSalt(5)
        const hashedPassword = await bcrypt.hash("jk",salt);
        const response = await User.createTheater({...userData,password:hashedPassword});

        return res.status(response.status).send(response.msg);
    }
    catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:"Failed to create the Theater",err})
    }
}