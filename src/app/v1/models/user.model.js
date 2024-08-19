import { StatusCodes } from "http-status-codes";
import config from "../../../../config.js";
import { poolPromise } from "../utils/dbConnection.js";
import bcrypt from 'bcryptjs';

class User{
    static async create(userData){
        const {firstName,lastName,dob,phone,gender,email,password} = userData;
        try{
            const pool = await poolPromise;
            const sql = `insert into user values(UUID(),?,?,?,?,?,?,?)`;
            const [{affectedRows}] = await pool.query(sql,[lastName,dob,phone,gender,email,firstName,password]);
            if(affectedRows > 0){
                return {status:StatusCodes.OK,msg:"Successfully added User"};
            }
        }
        catch(err){
            console.log(err)
        }
    }

    static async createTheater(userData){
        // console.log("register")
        const {theaterName,theaterAddress,rating,email,phone,password,capacity,state,city,address} = userData;
        try{
            const pool = await poolPromise;
            const sql = `insert into theater values(UUID(),?,?,?,?,?,?,?,?,?,?)`;
            const [{affectedRows}] = await pool.query(sql,[theaterName,theaterAddress,rating,email,phone,password,capacity,state,city,address]);
            if(affectedRows > 0){
                return {status:StatusCodes.OK,msg:"Successfully added Theater"};
            }
        }
        catch(err){
            console.log(err)
        }
    }

    static async loginUser(userData){
        const {phone,password} = userData;
        try{
            const pool = await poolPromise;
            const sql =  `select user_id,password from user where phone = ?`;
            const [rows] = await pool.query(sql,[phone]);
            if(rows.length > 0){
                const matched = await bcrypt.compare(password,rows[0].password);
                if(matched) return {status:StatusCodes.OK,msg:"Login Successful",userId:rows[0]["user_id"]}
                else throw new Error("Invalid credentials")
            }
            else throw new Error("No user found");
        }
        catch(err){
            throw err;
        }
    }
}

export default User;