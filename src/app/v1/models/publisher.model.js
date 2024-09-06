import { StatusCodes } from "http-status-codes";
import config from "../../../../config.js";
import { poolPromise } from "../utils/dbConnection.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

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
      email,
      phone,
      capacity,
      city,
      theaterAddress,
      password
    } = theaterData;
    try {
      const pool = await poolPromise;
      const theaterId = uuidv4();
      const sql = `insert into theater values(?,?,?,?,?,?,?,?)`;
      const [{ affectedRows }] = await pool.query(sql, [
        theaterId,
        theaterName,
        email,
        phone,
        capacity,
        city,
        theaterAddress,
        password
      ]);
      return { status: StatusCodes.OK, msg: "Successfully added Theater",data:{theaterId,theaterName}};
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async loginPublisher(publisherData) {
    const { phone, password } = publisherData;
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

  static formatDate(dateString) {
    const [day, month, year] = dateString.split(' ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(month);
    return `${year}-${monthIndex + 1}-${day.padStart(2, '0')}`;
  }
  
  static formatTime(minuteString) {
    let minutes = minuteString.split(" ")[0]
    console.log(minutes)
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2,'0')}`;
  }

  static async addMovie(movieData) {
    const { imdbID, theaterId, price, date, time } = movieData;
    try {
      var ddate = new Date(date);
      const pool = await poolPromise;
      const res = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=658d4be7`);
      var {Title,Rated,Released,Runtime,Genre,Director,Plot,Poster,Actors,Language} = res.data;

      if(Runtime === 'N/A') Runtime = "120 min"
      Runtime = this.formatTime(Runtime);

      if(Rated === 'N/A') Rated = 8;
      Released = this.formatDate(Released)

      const movieId = uuidv4();
      const [{affectedRows}] = await pool.query(`insert into movie values(?,?,?,?,?,?,?,?,?,?,?)`,[movieId,Title,Plot,Runtime,Rated,Genre,Poster,Actors,Released,Language,Director]);
      console.log(affectedRows)
      const theaterMovieId = uuidv4();
      const sql = "insert into theater_movie values(?,?,?,?,?)";
      await pool.query(sql, [theaterMovieId, theaterId, movieId, price, ddate]);
      const paramList = [];
      time.forEach(function (time) {
        paramList.push([uuidv4(), theaterMovieId, time]);
      });
      // console.log(paramList);
      const sql5 = `insert into theater_movie_time values ?`;
      await pool.query(sql5, [paramList]);
      // console.log(this.formatDate(Released));
      // console.log(this.formatTime(Runtime));
      return { status: StatusCodes.OK, msg: "Successfully added movie" };
    } catch (err) {
      console.log(err);
    }
  }

  static async getPublishedMovies(theaterId) {
    try {
      const pool = await poolPromise;
      const sql = `select tmt.theater_movie_time_id,m.movie_name,m.description,tm.price,tm.date,tmt.time from movie m join theater_movie tm join theater_movie_time tmt
      on tm.movie_id = m.movie_id and tmt.theater_movie_id = tm.theater_movie_id where tm.theater_id = ?`;
      const [rows] = await pool.query(sql, [theaterId]);
      console.log("rows")
      if (rows.length > 0) {
        return { status: StatusCodes.OK, data: rows };
      }
      return {
        status: StatusCodes.NOT_FOUND,
        msg: "No published movies found for this theater",
      };
    } catch (err) {
      console.error("Error fetching published movies:", err);
      throw {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        msg: "An error occurred",
      };
    }
  }

  static async cancelPublishedMovie(theaterMovieTimeId,date) {
    try {
      const pool = await poolPromise;
      const [rows] = await pool.query(`select theater_movie_id from theater_movie_time where theater_movie_time_id = ?`,[theaterMovieTimeId]);
      console.log(rows)
      const theaterMovieId = rows[0]["theater_movie_id"];
      await pool.query(`delete from theater_movie_time where theater_movie_time_id = ?`, [theaterMovieTimeId]);
      const sql = `select count(tm.theater_movie_id) as count from theater_movie_time tmt join theater_movie tm on tmt.theater_movie_id = tm.theater_movie_id where tm.date = ? and tm.theater_movie_id = ?`;
      const [rows2] = await pool.query(sql,[date,theaterMovieId]);
      const count = rows2[0]["count"];
      console.log(count)
      if(count <= 0){  
        await pool.query(`delete from theater_movie where theater_movie_id = ?`,[theaterMovieId]);
      }
      return { status: StatusCodes.OK, msg:"Show deleted successfully" };
    } catch (err) {
      console.error("Error deleting published movies:", err);
      throw {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        msg: "An error occurred",
      };
    }
  }
}

export default Publisher;
