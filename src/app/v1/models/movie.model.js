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

  static async bookMovie(movieData) {
    // const {userId,seatId,}
    try {
      const pool = await poolPromise;
      const sql = `insert into booking values(UUID(),?,?,?)`;
      const [rows] = await pool.query(sql, []);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
    } catch (err) {
      throw err;
    }
  }

  static async cancelMovie(movieData) {}
}

export default Movie;
