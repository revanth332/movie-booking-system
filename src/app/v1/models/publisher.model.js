import { StatusCodes } from "http-status-codes";
import config from "../../../../config.js";
import { poolPromise } from "../utils/dbConnection.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import nodemailer from 'nodemailer'

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
      password,
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
        password,
      ]);
      return {
        status: StatusCodes.OK,
        msg: "Successfully added Theater",
        data: { theaterId, theaterName },
      };
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
    const [day, month, year] = dateString.split(" ");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = months.indexOf(month);
    return `${year}-${monthIndex + 1}-${day.padStart(2, "0")}`;
  }

  static formatTime(minuteString) {
    let minutes = minuteString.split(" ")[0];
    console.log(minutes);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes
      .toString()
      .padStart(2, "0")}`;
  }

  static isAlphabetic(char) {
    const charCode = char.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  static async addMovie(movieData) {
    var { imdbID, theaterId, price, date, time:times } = movieData;
    try {
      var ddate = new Date(date);
      const pool = await poolPromise;
      const res = await axios.get(
        `http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=658d4be7`
      );
      var {
        Title,
        Rated,
        Released,
        Runtime,
        Genre,
        Director,
        Plot,
        Poster,
        Actors,
        Language,
      } = res.data;

      if (Runtime === "N/A") Runtime = "120 min";
      Runtime = this.formatTime(Runtime);

      if (Poster === "N/A" || Poster === "")
        Poster =
          "https://previews.123rf.com/images/macrovector/macrovector1501/macrovector150100418/35433359-cinema-movie-entertainment-poster-with-realistic-film-reel-vector-illustration.jpg";

      if (Rated === "N/A" || this.isAlphabetic(Rated)) Rated = 8;
      Released = this.formatDate(Released);

      const movieId = imdbID;
      var theaterMovieId = uuidv4();
      const [rows] = await pool.query(
        `select movie_id from movie where movie_id = ?`,
        [movieId]
      );
      if (rows.length <= 0) {
        const [{ affectedRows }] = await pool.query(
          `insert into movie values(?,?,?,?,?,?,?,?,?,?,?)`,
          [
            movieId,
            Title,
            Plot,
            Runtime,
            Rated,
            Genre,
            Poster,
            Actors,
            Released,
            Language,
            Director,
          ]
        );
        console.log(affectedRows);
      }

      const sql1 = `select tmt.time,tm.theater_movie_id from theater_movie tm join theater_movie_time tmt on tm.theater_movie_id = tmt.theater_movie_id
      where tm.theater_id = ? and tm.date = ? and tm.movie_id = ?`;
      const [rows2] = await pool.query(sql1, [theaterId, date, movieId]);
      if (rows2.length <= 0) {
        const sql = "insert into theater_movie values(?,?,?,?,?)";
        await pool.query(sql, [
          theaterMovieId,
          theaterId,
          movieId,
          price,
          ddate,
        ]);
      } else {
        const runningShowTimes = rows2.map((item) => item.time);
        times = times.filter((time) => !runningShowTimes.includes(time));
        theaterMovieId = rows2[0].theater_movie_id;
      }

      const paramList = [];
      times.forEach(function (time) {
        paramList.push([uuidv4(), theaterMovieId, time]);
      });

      const sql5 = `insert into theater_movie_time values ?`;
      await pool.query(sql5, [paramList]);
      return { status: StatusCodes.OK, msg: "Successfully added movie" };
    } catch (err) {
      console.log(err);
    }
  }

  static convertTo12HourFormat(time24) {
    let [hours, minutes] = time24.split(":");
    let num_hours = parseInt(hours);
  
    let period = num_hours >= 12 ? "PM" : "AM";
    num_hours = num_hours % 12 || 12; 
  
    return `${num_hours}:${minutes} ${period}`;
  }
  

  static async getPublishedMovies(theaterId) {
    try {
      const pool = await poolPromise;
      const sql = `select tmt.theater_movie_time_id,m.movie_name,m.description,tm.price,tm.date,tmt.time,tm.theater_movie_id,m.movie_id from movie m join theater_movie tm join theater_movie_time tmt
      on tm.movie_id = m.movie_id and tmt.theater_movie_id = tm.theater_movie_id where tm.theater_id = ?`;
      const [rows] = await pool.query(sql, [theaterId]);
      const data = rows.map((item) => {
        const cDate = item.date.setDate(item.date.getDate() + 1);
        return { ...item, date: new Date(cDate) };
      });

      if (rows.length > 0) {
        return { status: StatusCodes.OK, data };
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

  static async cancelPublishedMovie(
    theaterMovieTimeId,
    date,
    theaterMovieId,
    movieId
  ) {
    try {
      const pool = await poolPromise;
      // // const [rows] = await pool.query(`select theater_movie_id from theater_movie_time where theater_movie_time_id = ?`,[theaterMovieTimeId]);
      // console.log("cancel "+theaterMovieTimeId)
      // console.log(rows)
      // console.log("cancel",theaterMovieTimeId,date)
      // const theaterMovieId = rows[0]["theater_movie_id"];
      const sql2 = `select u.email,b.booking_id from user u join booking b on u.user_id = b.user_id where theater_movie_time_id = ? and b.status_id=1;`;
      const [rows3] = await pool.query(sql2,[theaterMovieTimeId]);
      if(rows3.length > 0){
      const bookingId = rows3[0].booking_id;
      const sql1 = `select t.theater_name,m.movie_name,tm.date,tmt.time from booking b join theater_movie_time tmt join theater_movie tm join theater t join movie m
      on b.theater_movie_time_id = tmt.theater_movie_time_id and tmt.theater_movie_id = tm.theater_movie_id and tm.theater_id = t.theater_id and tm.movie_id = m.movie_id
      where b.booking_id = ?`;
      const [tickets] = await pool.query(sql1,[bookingId]);
      const ticket = tickets[0]
      console.log(ticket)
      }
      await pool.query(
        `delete from theater_movie_time where theater_movie_time_id = ?`,
        [theaterMovieTimeId]
      );
      const sql = `select count(tm.theater_movie_id) as count from theater_movie_time tmt join theater_movie tm on tmt.theater_movie_id = tm.theater_movie_id where tm.date = ? and tm.theater_movie_id = ?`;
      const [rows] = await pool.query(sql, [date, theaterMovieId]);
      const count = rows[0]["count"];
      console.log("cancel " + count);
      if (count <= 0) {
        await pool.query(
          `delete from theater_movie where theater_movie_id = ? and date = ?`,
          [theaterMovieId, date]
        );
        const [rows2] = await pool.query(
          `select count(movie_id) as count from theater_movie where movie_id = ?`,
          [movieId]
        );
        const moviesCount = rows2[0]["count"];
        console.log(moviesCount);
        if (moviesCount <= 0) {
          await pool.query(`delete from movie where movie_id = ?`, [movieId]);
        }
      }
      const mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.APP_MAIL_USER,
            pass:process.env.APP_MAIL_PASS
        }
    });


      if(rows3.length > 0){

        const html = `<!DOCTYPE html>
        <html>
        <head>
          <title>Movie Cancelled</title>
        </head>
        <body>
          <div style="background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; padding: 20px; margin: 20px auto; width: 80%; max-width: 500px;">
            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;color:red">Movie Cancellation</h2>
            <p>We regret to inform you that your booking for the following movie has been canceled due to technical issues:</p>
            <table>
              <tr>
                <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Movie Name</th>
                <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Theater Name</th>
                <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Date</th>
                <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Time</th>
              </tr>
              <tr>
                <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">${ticket.movie_name}</td>
                <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">${ticket.theater_name}</td>
                <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">${ticket.date.toString().substring(0,10)}</td>
                <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">${this.convertTo12HourFormat(ticket.time.substring(0,5))}</td>
              </tr>
            </table>
            <p>We apologize for any inconvenience this may cause. Please contact our customer support for assistance.</p>
          </div>
        </body>
        </html>`

        const email = rows3[0].email;
        const mailDetails = {
        from: process.env.APP_MAIL_USER,
        to: email,
        subject: "Movie Cancelled",
        html
      };

      mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
    });
  }
      return { status: StatusCodes.OK, msg: "Show deleted successfully" };
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
