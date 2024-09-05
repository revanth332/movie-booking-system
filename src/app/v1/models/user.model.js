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
      const userId = uuidv4();
      const sql = `insert into user values(?,?,?,?,?,?,?,?)`;
      await pool.query(sql, [
        userId,
        firstName,
        lastName,
        dob,
        phone,
        gender,
        email,
        password,
      ]);

      return { status: StatusCodes.OK, msg: "Successfully added User",data:{userId,userName:firstName} };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async loginUser(userData) {
    const { phone, password } = userData;
    console.log(phone);
    try {
      const pool = await poolPromise;
      const sql = `select user_id,password,first_name from user where phone = ?`;
      const [rows] = await pool.query(sql, [phone]);
      if (rows.length > 0) {
        const matched = await bcrypt.compare(password, rows[0].password);
        if (matched)
          return {
            status: StatusCodes.OK,
            msg: "Login Successful",
            userId: rows[0]["user_id"],
            userName: rows[0]["first_name"],
            role:"user"
          };
        else{
          const sql = `select theater_id,password,theater_name from theater where phone = ?`;
        const [rows] = await pool.query(sql, [phone]);
        if (rows.length > 0) {
          const matched = await bcrypt.compare(password, rows[0].password);
          if (matched)
            return {
              status: StatusCodes.OK,
              msg: "Login Successful",
              userId: rows[0]["theater_id"],
              userName: rows[0]["theater_name"],
              role:"publisher"
            };
          else throw new Error("Invalid credentials");
        }
        }
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err)
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
    const { userId, seats, theaterTimeMovieId } = bookingData;
    console.log("hello");
    console.log(bookingData);
    try {
      const pool = await poolPromise;
      const bookingId = uuidv4();
      await pool.query(`insert into booking values (?,?,?,?,?)`, [
        bookingId,
        new Date(),
        userId,
        1,
        theaterTimeMovieId,
      ]);
      const paramList = [];
      seats.forEach((seatId) => {
        paramList.push([uuidv4(), bookingId, seatId]);
      });
      await pool.query("insert into booking_details values ?", [paramList]);
      const response = await pool.query(
        "update seat set status_id = 1 where seat_id in (?)",
        [seats]
      );
      console.log(response);
    } catch (err) {
      console.log(err);
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
      const sql = `select tm.theater_movie_id,t.theater_name,m.movie_name,t.city,t.theater_address,tm.price,tm.date from theater_movie tm join theater t join movie m on t.theater_id = tm.theater_id and m.movie_id=tm.movie_id where tm.movie_id= ?`;
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

  static async getBookings(userId) {
    try {
      const pool = await poolPromise;
      const sql = `select b.booking_id,t.theater_name,m.movie_name,tmt.time,tm.price,b.booking_date,count(b.booking_id) as seats_count from booking b join booking_details bd join theater_movie_time tmt join theater_movie tm join theater t join movie m
      on b.booking_id = bd.booking_id and b.theater_movie_time_id = tmt.theater_movie_time_id and tm.theater_movie_id = tmt.theater_movie_id
      and t.theater_id = tm.theater_id and m.movie_id = tm.movie_id where b.status_id = 1 and user_id = ? group by b.booking_id;`;
      const [rows] = await pool.query(sql, [userId]);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
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

  static async getTheaterTimeMovieId(theaterMovieId, time) {
    try {
      const pool = await poolPromise;
      const sql = `select theater_movie_time_id from theater_movie_time where theater_movie_id = ? and time = ?`;
      const [rows] = await pool.query(sql, [theaterMovieId, time]);
      console.log(rows);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      throw err;
    }
  }

  static async getSeats(theaterMovieTimeId) {
    try {
      const pool = await poolPromise;
      const sql = `select * from seat where theater_movie_time_id = ?`;
      const [rows] = await pool.query(sql, [theaterMovieTimeId]);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async getMoviesByGenre(genre) {
    try {
      const pool = await poolPromise;
      const sql = `select * from movie where genre like '%${genre}%'`;
      const [rows] = await pool.query(sql);
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      throw { status: StatusCodes.CONFLICT, msg: "Bad sql syntax" };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

export default User;
