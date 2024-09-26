import request from "supertest";
import User from "../src/app/v1/models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { query, response } from "express";
import { bookMovie, cancelBooking, getMovies,getShowTimes,getTheaters,loginUser, registerUser,getBookings, getTheaterTimeMovieId, getSeats, getMoviesByGenre } from "../src/app/v1/controllers/user.controller.js";
import { closeConnection } from "../src/app/v1/utils/dbConnection.js";
import pkg from "jsonwebtoken";
import bcrypt from "bcryptjs";

const {sign} = pkg;

afterAll(async () => {
  await closeConnection();
})

describe("user conroller",() => {

  describe("fetch Movies", () => {
    let mockReq,mockRes;
    
    beforeEach(() => {
      mockReq = {
        body:{},
        query: {},
        params:{},
        user:{}
      }
      mockRes = {
        status:jest.fn().mockReturnThis(),
        send:jest.fn()
      }
  
    })

    let mockMovie = {
      movie_id:"movie_id",
      movie_name:"The Spider of Spiderweb Canyon",
      description:"A woman making a video in a forest encounters a strange stranger.",
      duration:"00:11:00",
      rating:"8.00",
      genre:"Short, Sci-Fi",
      poster_url:"https://m.media-amazon.com/images/M/MV5BMjFkYWIxNWUtMjVmOS00ZWVjLWJlNzktMzNhMjhkNWQ0YzJkXkEyXkFqcGdeQXVyMTI5NjMxOTQ@._V1_SX300.jpg",
      actors:"Andra Beatty, Allison Roper",
      release_date:"2024-1-01",
      language:"English",
      director:"S.W. Hannan"
    }
  
    it("should fetch movies",async () => {
      jest.spyOn(User,"getMovies").mockResolvedValueOnce({status:200,data:[mockMovie]});
  

  
      await getMovies(mockReq,mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([mockMovie])
    })
  })

  describe("user login",() => {
    let mockReq,mockRes;
    beforeEach(()=>{
      mockReq = { body: { username: 'testUser', password: 'password' } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    })

    test('should login successfully', async () => {
      // Mock the User.loginUser method to return a successful response
      jest.spyOn(User,"loginUser").mockResolvedValueOnce({
        status: 200,
        msg: 'Login successful',
        userId: 1,  
        userName: 'testUser',
        role: 'admin'
      });
    
      await loginUser(mockReq, mockRes);
    
      expect(User.loginUser).toHaveBeenCalledWith({ username: 'testUser', password: 'password' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        msg: 'Login successful',
        token: expect.any(String), // Expect a token to be present
        userId: 1,
        userName: 'testUser',
        role: 'admin'
      });
    });

    test('should handle login failure', async () => {
      const mockError = new Error("Unexpected error");
      // Mock the User.loginUser method to throw an error with status and msg properties
      User.loginUser.mockRejectedValueOnce(mockError);
    
      const mockReq = { body: { username: 'testUser', password: 'password' } };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    
      await loginUser(mockReq, mockRes);
    
      expect(User.loginUser).toHaveBeenCalledWith({ username: 'testUser', password: 'password' });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred: "+mockError);
    });

  })

  describe("user register",() => {
    let mockUser = {
      firstName:"Ravani",
      lastName:"Lanka",
      phone:"9959965977",
      email:"ravani@gmail.com",
      password:"Moye@321"
    }
    let mockReq,mockRes;
    beforeEach(()=>{
      mockReq = { body: mockUser };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    })
    
    test("should register user successfully", async () => {
      jest.spyOn(User,"registerUser").mockResolvedValueOnce({
        status: StatusCodes.OK,
        msg: "Successfully added User",
        data: { userId:"abcd", userName: "Ravani" },
      });

      jest.spyOn(bcrypt,"hash").mockResolvedValueOnce("hashedpassword");
      jest.spyOn(pkg,"sign").mockResolvedValueOnce("token");
      jest.spyOn(bcrypt,"genSalt").mockResolvedValueOnce("salt");
      await registerUser(mockReq,mockRes);

      mockUser = {...mockUser,password:"hashedpassword"}

      expect(User.registerUser).toHaveBeenCalledWith(mockUser);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(5);
      expect(bcrypt.hash).toHaveBeenCalledWith("Moye@321","salt");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        userId: expect.any(String),
        userName: "Ravani",
        token:expect.any(String),
        role: "user",
      })
    })

    test("should throw error while registering", async () => {
      jest.spyOn(User,"registerUser").mockRejectedValueOnce(new Error("An error occurred"));

      jest.spyOn(bcrypt,"hash").mockResolvedValueOnce("hashedpassword");
      jest.spyOn(pkg,"sign").mockResolvedValueOnce("token");
      jest.spyOn(bcrypt,"genSalt").mockResolvedValueOnce("salt");
      await registerUser(mockReq,mockRes);

      mockUser = {...mockUser,password:"hashedpassword"}

      expect(User.registerUser).toHaveBeenCalledWith(mockUser);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(5);
      expect(bcrypt.hash).toHaveBeenCalledWith("Moye@321","salt");
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred")
    })
  })

  describe("movie booking",() => {
    let mockReq,mockRes;
    beforeEach(()=>{
      mockReq = { body: { userId:"user1", seats:["seat1","seat2"], theaterTimeMovieId:"theatertimemovieid" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    })

    it("should book movie successfully", async () => {
      jest.spyOn(User,"bookMovie").mockResolvedValueOnce({ status: StatusCodes.OK, msg: "Successfully booked movie" });

      await bookMovie(mockReq,mockRes);

      expect(User.bookMovie).toHaveBeenCalledWith({ userId:"user1", seats:["seat1","seat2"], theaterTimeMovieId:"theatertimemovieid" });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("Booked succesfully");
    })

    it("should throw error on booking movie", async () => {
      jest.spyOn(User,"bookMovie").mockRejectedValueOnce(new Error("An error occurred"));

      await bookMovie(mockReq,mockRes);

      expect(User.bookMovie).toHaveBeenCalledWith({ userId:"user1", seats:["seat1","seat2"], theaterTimeMovieId:"theatertimemovieid" });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
    })

  })

  describe("cancelBooking",() => {
    let mockReq,mockRes;
    beforeEach(()=>{
      mockReq = { body: { bookingId:"bookingid" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    })

    it("should cancel booking successfully", async () => {
      jest.spyOn(User,"cancelBooking").mockResolvedValueOnce({ status: StatusCodes.OK, msg: "Successfully cancelled movie" })

      await cancelBooking(mockReq,mockRes);

      expect(User.cancelBooking).toHaveBeenCalledWith({ bookingId:"bookingid" });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("Movie cancelled succesfully");
    })

    it("should throw error while canceling booking", async () => {
      jest.spyOn(User,"cancelBooking").mockRejectedValueOnce(new Error("An error occurred"))

      await cancelBooking(mockReq,mockRes);

      expect(User.cancelBooking).toHaveBeenCalledWith({ bookingId:"bookingid" });
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
    })

  })

  describe("getShowTimes from theater movie id",() => {
    let mockReq,mockRes,mockShow;
    beforeEach(()=>{
      mockReq = { query: { theaterMovieId:"theaterMovieId" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      mockShow = {
        time:"10:00:00"
      }
    })

    it("should return show times successfully", async () => {
      jest.spyOn(User,"getShowTimes").mockResolvedValueOnce({status: StatusCodes.OK, data: [mockShow]});

      await getShowTimes(mockReq,mockRes);

      expect(User.getShowTimes).toHaveBeenCalledWith("theaterMovieId");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([mockShow]);
    })

    it("should throw error while showing times", async () => {
      jest.spyOn(User,"getShowTimes").mockRejectedValueOnce(new Error("An error occurred"));

      await getShowTimes(mockReq,mockRes);

      expect(User.getShowTimes).toHaveBeenCalledWith("theaterMovieId");
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
    })
  })

  describe("fetching Theaters",() => {
    let mockReq,mockRes,mockTheater;
    beforeEach(()=>{
      mockReq = { query: { movieId:"movieid" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      mockTheater = {
        theater_movie_id:"abcd",
        theater_name:"Sun Theater",
        movie_name:"Devara",
        city:"Vizag",
        theater_address:"Near sivalayam",
        price:"124",
        date:"2024-09-09"
      }
    })

    it("should fetch theaters sucessfully based on movie Id", async () => {
      jest.spyOn(User,"getTheaters").mockResolvedValueOnce({status: StatusCodes.OK, data:[mockTheater]})

      await getTheaters(mockReq,mockRes);

      expect(User.getTheaters).toHaveBeenCalledWith("movieid");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([mockTheater]);
    })

    it("should throw error while fetching theaters based on movie Id", async () => {
      jest.spyOn(User,"getTheaters").mockRejectedValueOnce(new Error("An error occurred"));

      await getTheaters(mockReq,mockRes);

      expect(User.getTheaters).toHaveBeenCalledWith("movieid");
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
    })
  })

  describe("fetching Bookings",() => {
    let mockReq,mockRes,mockBooking;
    beforeEach(()=>{
      mockReq = { query: { userId:"userid" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      mockBooking = {
        booking_id:"booking123",
        theater_name:"Sun Theater",
        movie_name:"Devara",
        time:"10:00",
        price:"130",
        date:"2024-09-09",
        seats_count:3
      }
    })

    it("should fetch bookings based on userid",async () => {
      jest.spyOn(User,"getBookings").mockResolvedValueOnce({status: StatusCodes.OK, data: [mockBooking]})

      await getBookings(mockReq,mockRes);

      expect(User.getBookings).toHaveBeenCalledWith("userid");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([mockBooking]);
    })

    it("should throw error while fetching bookings based on userid",async () => {
      jest.spyOn(User,"getBookings").mockRejectedValueOnce(new Error)

      await getBookings(mockReq,mockRes);

      expect(User.getBookings).toHaveBeenCalledWith("userid");
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
    })
  })

  describe("fetching Theater Movie Ids",() => {
    let mockReq,mockRes;
    beforeEach(()=>{
      mockReq = { query: { theaterMovieId:"theatermovie123", time:"10:00" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    })

    it("should fetch Theater Movie Id based on theater movie id and time", async () => {
      jest.spyOn(User,"getTheaterTimeMovieId").mockResolvedValueOnce({status: StatusCodes.OK, data: [{theaterTimeMovieId:"theatermovietime123"}]});
      await getTheaterTimeMovieId(mockReq,mockRes);

      expect(User.getTheaterTimeMovieId).toHaveBeenCalledWith("theatermovie123","10:00");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([{theaterTimeMovieId:"theatermovietime123"}]);
    })

    it("should throw error while fetching Theater Movie Ids based on theater movie id and time", async () => {
      jest.spyOn(User,"getTheaterTimeMovieId").mockRejectedValueOnce(new Error("An error occured"));
      await getTheaterTimeMovieId(mockReq,mockRes);

      expect(User.getTheaterTimeMovieId).toHaveBeenCalledWith("theatermovie123","10:00");
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occured");
    })

    describe("fetching seat details",() => {
      let mockReq,mockRes,mockSeat;
      beforeEach(()=>{
        mockReq = { query: { theaterMovieTimeId:"theatermovietime123" } };
        mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        mockSeat = {
          seat_id:"seat123",
          theater_movie_time_id:"theater1movie2time10",
          seat_number:12,
          status_id:1
        }
      })

      it("should fetch seat details successfully", async () => {
        jest.spyOn(User,"getSeats").mockResolvedValueOnce({status: StatusCodes.OK, data: [mockSeat]})

        await getSeats(mockReq,mockRes);

        expect(User.getSeats).toHaveBeenCalledWith("theatermovietime123");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith([mockSeat]);
      })

      it("should throw error while fetching seats details", async () => {
        jest.spyOn(User,"getSeats").mockRejectedValueOnce(new Error("An error occurred"))

        await getSeats(mockReq,mockRes);

        expect(User.getSeats).toHaveBeenCalledWith("theatermovietime123");
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
      })
    })

    describe("fetch movies based on genre",() => {
      let mockReq,mockRes,mockMovie;
      beforeEach(()=>{
        mockReq = { query: { genre:"drama" } };
        mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        mockMovie = {
          movie_id:"movie_id",
          movie_name:"The Spider of Spiderweb Canyon",
          description:"A woman making a video in a forest encounters a strange stranger.",
          duration:"00:11:00",
          rating:"8.00",
          genre:"Short, Sci-Fi",
          poster_url:"https://m.media-amazon.com/images/M/MV5BMjFkYWIxNWUtMjVmOS00ZWVjLWJlNzktMzNhMjhkNWQ0YzJkXkEyXkFqcGdeQXVyMTI5NjMxOTQ@._V1_SX300.jpg",
          actors:"Andra Beatty, Allison Roper",
          release_date:"2024-1-01",
          language:"English",
          director:"S.W. Hannan"
        }
      })

      it("should  fetch movies based on genre successfully", async () => {
        jest.spyOn(User,"getMoviesByGenre").mockResolvedValueOnce({status: StatusCodes.OK,data:[mockMovie]});

        await getMoviesByGenre(mockReq,mockRes);

        expect(User.getMoviesByGenre).toHaveBeenCalledWith("drama");
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith([mockMovie]);
      })

    })

  })

  

})


