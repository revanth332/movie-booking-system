import mysql from 'mysql2/promise';
import { poolPromise } from "../utils/dbConnection.js";
import config from '../../../../config.js';
import { StatusCodes } from 'http-status-codes';

class Movie{
    static async addMovie(movieData){
        const {movieName,theaterId,price} = movieData;
        try{
            const pool = await poolPromise;
            const sql = `insert into movie values(UUID(),?)`;
            const [{affectedRows}] = await pool.query(sql,[movieName])
            if(affectedRows > 0){
                const sql2 = `select movie_id from movie where movie_name = ?`;
                const [rows] = await pool.query(sql2,movieName);
                // console.log(rows)
                const movieId = rows[0]["movie_id"];
    
                const sql3 = `insert into theater_movie values(UUID(),?,?,?)`;
                const [{affectedRows2}] = await pool.query(sql3,[theaterId,movieId,price]);
                if(affectedRows > 0){
                    return {status:StatusCodes.OK,msg:"Successfully added movie"}
                }
            }
        }
        catch(err){
            throw err;
        }
    }

    static async getMovies(){
        try{
            const pool = await poolPromise;
            const sql = `select * from movie`;
            const [rows] = await pool.query(sql);
            if(rows.length > 0){
                return {status:StatusCodes.OK,data:rows};
            }
        }
        catch(err){
           throw err;
        }
    }

    static async bookMovie(movieData){
        // const {userId,seatId,}
        try{
            const pool = await poolPromise;
            const sql = `insert into booking values(UUID(),?,?,?)`;
            const [rows] = await pool.query(sql,[]);
            if(rows.length > 0){
                return {status:StatusCodes.OK,data:rows};
            }
        }
        catch(err){
           throw err;
        }
    }

    static async cancelMovie(movieData){
        
    }
}

export default Movie;