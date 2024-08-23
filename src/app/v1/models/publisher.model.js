import { StatusCodes } from "http-status-codes";
import config from "../../../../config.js";
import { poolPromise } from "../utils/dbConnection.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

class Publisher {
  static async findPublisher(userId) {
    console.log(userId);
    try {
      const pool = await poolPromise;
      const sql = `select theater_id from theater where theater_id = ?`;
      const [rows] = await pool.query(sql, [userId]);
      if (rows.length > 0) {
        return {
          status: StatusCodes.OK,
          msg: "publisher found",
        };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async registerTheater(theaterData) {
    // console.log("register")
    const {
      theaterName,
      theaterAddress,
      email,
      phone,
      password,
      capacity,
      state,
      city,
    } = theaterData;
    try {
      const pool = await poolPromise;
      const sql = `insert into theater values(UUID(),?,?,?,?,?,?,?,?)`;
      const [{ affectedRows }] = await pool.query(sql, [
        theaterName,
        theaterAddress,
        email,
        phone,
        capacity,
        state,
        city,
        password,
      ]);
      if (affectedRows > 0) {
        return { status: StatusCodes.OK, msg: "Successfully added Theater" };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async loginPublisher(publisherData) {
    const { phone, password } = publisherData;
    // console.log(publisherData)
    try {
      const pool = await poolPromise;
      const sql = `select theater_id,password,theater_name from theater where phone = ?`;
      const [rows] = await pool.query(sql, [phone]);
      if (rows.length > 0) {
        const matched = await bcrypt.compare(password, rows[0].password);
        if (matched)
          return {
            status: StatusCodes.OK,
            msg: "Login Successful",
            theaterId: rows[0]["theater_id"],
            theaterName: rows[0]["theater_name"],
          };
        else throw new Error("Invalid credentials");
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async registerMovie(movieData) {
    // console.log("register")
    const { movieName, description, duration, rating } = movieData;
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
        return { status: StatusCodes.OK, msg: "Successfully added movie" };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async addMovie(movieData) {
    const { movieId, theaterId, price, date, timings } = movieData;
    try {
      const pool = await poolPromise;
      const sql = `insert into theater_movie values(UUID(),?,?,?,?)`;
      const [{ affectedRows }] = await pool.query(sql, [
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
        const [{ affectedRows }] = await pool.query(sql5, [paramList]);
        if (affectedRows > 0) {
          return { status: StatusCodes.OK, msg: "Successfully added movie" };
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  // static async getPublishedMovies(theaterId) {
  //   console.log(theaterId)
  //   try {
  //     const pool = await poolPromise;
  //     const sql = `select m.movie_name,m.description from movie m join theater_movie tm on tm.movie_id = m.movie_id where theater_id = ?`;
  //     const [rows] = await pool.query(sql, [theaterId]);
  //     if (rows.length > 0) {
  //       return { status: StatusCodes.OK, data: rows };
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
  // }

  static async getPublishedMoviess(theaterId) {
    try {
      const pool = await poolPromise;
      const sql = `select m.movie_name,m.description from movie m join theater_movie tm on tm.movie_id = m.movie_id where theater_id = ?`;
      const [rows] = await pool.query(sql, [theaterId]);
  
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      return { status: StatusCodes.NOT_FOUND, msg: "No published movies found for this theater" };
    } catch (err) {
      console.error("Error fetching published movies:", err);
      throw { status: StatusCodes.INTERNAL_SERVER_ERROR, msg: "An error occurred" };
    }
  }
}

export default Publisher;
