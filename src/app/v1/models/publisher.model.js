import { StatusCodes } from "http-status-codes";
import config from "../../../../config.js";
import { poolPromise } from "../utils/dbConnection.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

class Publisher {
  static async findPublisher(userId) {
    try {
      const pool = await poolPromise;
      const sql = `select theater_id from theater where theater_id = ?`;
      const [rows] = await pool.query(sql, [userId]);
      if (rows.length > 0) {
        this.registerUser.send({
          status: StatusCodes.OK,
          msg: "publisher found",
        });
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
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
    try {
      const pool = await poolPromise;
      const sql = `select theater_id,password from theater where phone = ?`;
      const [rows] = await pool.query(sql, [phone]);
      if (rows.length > 0) {
        const matched = await bcrypt.compare(password, rows[0].password);
        if (matched)
          return {
            status: StatusCodes.OK,
            msg: "Login Successful",
            theaterId: rows[0]["theater_id"],
          };
        else throw new Error("Invalid credentials");
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
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
}

export default Publisher;
