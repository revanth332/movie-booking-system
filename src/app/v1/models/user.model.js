import { StatusCodes } from "http-status-codes";
import config from "../../../../config.js";
import { poolPromise } from "../utils/dbConnection.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

class User {
  static async findUser(userId) {
    try {
      const pool = await poolPromise;
      const sql = `select user_id from user where user_id = ?`;
      const [rows] = await pool.query(sql, [userId]);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, msg: "user found" };
      } else return { status: StatusCodes.NOT_FOUND, msg: "user not found" };
    } catch (err) {
      throw err;
    }
  }
  static async registerUser(userData) {
    const { firstName, lastName, dob, phone, gender, email, password } =
      userData;
    try {
      const pool = await poolPromise;
      const sql = `insert into user values(UUID(),?,?,?,?,?,?,?)`;
      const [{ affectedRows }] = await pool.query(sql, [
        firstName,
        lastName,
        dob,
        phone,
        gender,
        email,
        password,
      ]);
      if (affectedRows > 0) {
        return { status: StatusCodes.OK, msg: "Successfully added User" };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async loginUser(userData) {
    const { phone, password } = userData;
    console.log(phone)
    try {
      const pool = await poolPromise;
      const sql = `select user_id,password from user where phone = ?`;
      const [rows] = await pool.query(sql, [phone]);
      if (rows.length > 0) {
        const matched = await bcrypt.compare(password, rows[0].password);
        if (matched)
          return {
            status: StatusCodes.OK,
            msg: "Login Successful",
            userId: rows[0]["user_id"],
          };
        else throw new Error("Invalid credentials");
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
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
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async bookMovie(bookingData) {
    const { userId, seatId } = bookingData;
    try {
      const pool = await poolPromise;
      const sql = `insert into booking values(UUID(),?,?,1)`;
      const [{ affectedRows }] = await pool.query(sql, [userId, seatId]);
      if (affectedRows > 0) {
        return { status: StatusCodes.OK, msg: "Successfully booked movie" };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async cancelBooking(bookingData) {
    const { bookingId } = bookingData;
    try {
      const pool = await poolPromise;
      const sql = `update booking set status_id = 2 where booking_id = ?`;
      const [{ affectedRows }] = await pool.query(sql, [bookingId]);
      if (affectedRows > 0) {
        return { status: StatusCodes.OK, msg: "Successfully cancelled movie" };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async getShowTimes(theaterMovieId) {
    try {
      const pool = await poolPromise;
      const sql = `select time from theater_movie_time where theater_movie_id = ?`;
      const [rows] = await pool.query(sql, theaterMovieId);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async getTheaters(movieId) {
    try {
      const pool = await poolPromise;
      const sql = `select tm.theater_movie_id,t.theater_name,m.movie_name,t.city,t.theater_address,tm.price from theater_movie tm join theater t join movie m on t.theater_id = tm.theater_id and m.movie_id=tm.movie_id where tm.movie_id= ?`;
      const [rows] = await pool.query(sql, [movieId]);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async getBookings(feedbackData) {
    const { userId, movieId, rating } = feedbackData;
    try {
      const pool = await poolPromise;
      const sql = `select t.theater_name,m.movie_name,tm.price,tmt.time from booking b join seat s join theater_movie_time tmt join theater_movie tm join theater t join movie m
                on b.seat_id = s.seat_id and s.theater_movie_time_id = tmt.theater_movie_time_id and tm.theater_movie_id = tmt.theater_movie_id and t.theater_id = tm.theater_id and tm.movie_id = m.movie_id;`;
      const [rows] = await pool.query(sql, [movieId]);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async submitFeedback(feedbackData) {
    const { userId, movieId, rating } = feedbackData;
    try {
      const pool = await poolPromise;
      const sql = `insert into feedback values(uuid(),?,?,?)`;
      const [{ affectedRows }] = await pool.query(sql, [
        movieId,
        userId,
        rating,
      ]);
      if (affectedRows > 0) {
        return { status: StatusCodes.OK, msg: "Feedback added successfully" };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async getTrendingMovies() {
    try {
      const pool = await poolPromise;
      const sql = `select * from movie`;
      const [rows] = await pool.query(sql);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async getTheaterTimeMovieId(theaterMovieId,time) {
    try {
      const pool = await poolPromise;
      const sql = `select theater_movie_time_id from theater_movie_time where theater_movie_id = ? and time = ?`;
      const [rows] = await pool.query(sql,[theaterMovieId,time]);
      console.log(rows)
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async getSeats(theaterMovieId,time) {
    try {
      const pool = await poolPromise;
      const sql = `select theater_movie_time_id from theater_movie_time where theater_movie_id = ? and time = ?`;
      const [rows] = await pool.query(sql,[theaterMovieId,time]);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

}

export default User;
