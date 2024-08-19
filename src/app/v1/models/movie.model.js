import mysql from "mysql2/promise";
import { poolPromise } from "../utils/dbConnection.js";
import config from "../../../../config.js";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

class Movie {
  static async addMovie(movieData) {
    const {
      movieName,
      theaterId,
      price,
      description,
      duration,
      rating,
      date,
      timings,
    } = movieData;
    try {
      const pool = await poolPromise;
      const sql = `insert into movie values(UUID(),?,?,?,?)`;
      const [{ affectedRows }] = await pool.query(sql, [
        movieName,
        description,
        duration,
        rating,
      ]);
      if (affectedRows > 0) {
        const sql2 = `select movie_id from movie where movie_name = ?`;
        const [rows] = await pool.query(sql2, movieName);
        // console.log(rows)
        const movieId = rows[0]["movie_id"];

        const sql3 = `insert into theater_movie values(UUID(),?,?,?,?)`;
        const [{ affectedRows }] = await pool.query(sql3, [
          theaterId,
          movieId,
          price,
          date,
        ]);
        if (affectedRows > 0) {
          const sql4 = `select theater_movie_id from theater_movie where theater_id = ? and movie_id = ? and date = ?`;
          const [rows] = await pool.query(sql4, [theaterId, movieId, date]);
          const theaterMovieId = rows[0]["theater_movie_id"];
          var paramList = [];
          timings.forEach(function (time) {
            paramList.push([uuidv4(), theaterMovieId, time]);
          });
          const sql5 = `insert into theater_movie_time values ?`;
          const [{ affectedRows }] = await pool.query(sql5,[paramList]);
          if (affectedRows > 0) {
            return { status: StatusCodes.OK, msg: "Successfully added movie" };
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }


  static async getMovies() {
    try {
      const pool = await poolPromise;
      const sql = `select * from movie`;
      const [rows] = await pool.query(sql);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
    } catch (err) {
      throw err;
    }
  }

  static async bookMovie(bookingData){
    const {userId,seatId} = bookingData;
    try{
        const pool = await poolPromise;
        const sql = `insert into booking values(UUID(),?,?,1)`;
        const [{affectedRows}] = await pool.query(sql,[userId,seatId]);
        if(affectedRows > 0){
            return {status:StatusCodes.OK,msg:"Successfully booked movie"};
        }
    }
    catch(err){
       throw err;
    }
}

static async cancelBooking(bookingData){
    const {bookingId} = bookingData;
    try{
    const pool = await poolPromise;
    const sql = `update booking set status_id = 2 where booking_id = ?`;
    const [{affectedRows}] = await pool.query(sql,[bookingId]);
    if(affectedRows > 0){
    return {status:StatusCodes.OK,msg:"Successfully cancelled movie"};
    }
    }
    catch(err){
        console.log(err)
    // throw err;
    }
    }

    static async getShowTimes(theaterMovieId){
        try{
            const pool = await poolPromise;
            const sql = `select time from theater_movie_time where theater_movie_id = ?`;
            const [rows] = await pool.query(sql,theaterMovieId);
            if(rows.length > 0){
                return {status:StatusCodes.OK,data:rows};
            }
        }
        catch(err){
           throw err;
        }
    }

    static async getTheaters(movieId){
        try{
            const pool = await poolPromise;
            const sql = `select tm.theater_movie_id,t.theater_name,t.city,t.address,tm.price from theater_movie tm join theater t on t.theater_id = tm.theater_id where tm.movie_id = ?`;
            const [rows] = await pool.query(sql,[movieId]);
            if(rows.length > 0){
                return {status:StatusCodes.OK,data:rows};
            }
        }
        catch(err){
           throw err;
        }
    }
}

export default Movie;
