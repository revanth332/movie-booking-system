import User from "../../src/app/v1/models/user.model";
import { StatusCodes } from "http-status-codes";
import {
  closeConnection,
  poolPromise,
} from "../../src/app/v1/utils/dbConnection.js";


// jest.mock("mysql2/promise");
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

var mockPool;

beforeAll(async () => {
  mockPool = await poolPromise;
});

afterAll(async () => {
  await closeConnection();
});

describe("fetching movies",() => {
    it("should fetch movies",async () => {
      let mockMovie = {
        movie_id: "movie_id",
        movie_name: "The Spider of Spiderweb Canyon",
        description:
          "A woman making a video in a forest encounters a strange stranger.",
        duration: "00:11:00",
        rating: "8.00",
        genre: "Short, Sci-Fi",
        poster_url:
          "https://m.media-amazon.com/images/M/MV5BMjFkYWIxNWUtMjVmOS00ZWVjLWJlNzktMzNhMjhkNWQ0YzJkXkEyXkFqcGdeQXVyMTI5NjMxOTQ@._V1_SX300.jpg",
        actors: "Andra Beatty, Allison Roper",
        release_date: "2024-1-01",
        language: "English",
        director: "S.W. Hannan",
      };
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([[mockMovie]]);

      const result = await User.getMovies()

      expect(result).toEqual({ status: StatusCodes.OK, data: [mockMovie] })
    })
  })

  
  describe("booking Movie",() => {
    it("should book movie", async () => {
      let mockData = { userId:"useruuid",seats:["seat1uuid","seat2uuid"], theaterTimeMovieId : "theaterTimeMovieId" }
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([{affectedRows : 1}]).mockResolvedValueOnce([{affectedRows : 1}]).mockResolvedValueOnce([{affectedRows : 1}]);

      const result = await User.bookMovie(mockData);

      expect(result).toEqual({ status: StatusCodes.OK, msg: "Successfully booked movie" })
    })
  })
  
  describe("cancelling Movie",() => {
    it("should cancel movie", async () => {
      let mockData = { bookingId : "bookingid123" }
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([{affectedRows:1}])
                                   .mockResolvedValueOnce([[{"seat_id":"seat1","seat_id":"seat2"}]])
                                   .mockResolvedValueOnce([{affectedRows : 1}]);

      const result = await User.cancelBooking(mockData);

      expect(result).toEqual({ status: StatusCodes.OK, msg: "Successfully cancelled movie" })
    })
  })


  describe("fetching show times",() => {
    it("should  fetch show times", async () => {
        let mockTheaterMovieId = "theatermovieid";
        let mockData = {time:"22:00"}
        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockData]]);

        const result = await User.getShowTimes(mockTheaterMovieId);

        expect(result).toEqual({ status: StatusCodes.OK, data: [mockData] })
    })

  })

  describe("fetching Theaters",() => {
    it("should fetch theaters", async () => {
        let movieId = "theatermovieid";
        let mockTheater = {
            theater_movie_id: "abcd",
            theater_name: "Sun Theater",
            movie_name: "Devara",
            city: "Vizag",
            theater_address: "Near sivalayam",
            price: "124",
            date: "2024-09-09",
          };
        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockTheater]]);

        const result = await User.getShowTimes(movieId);

        expect(result).toEqual({ status: StatusCodes.OK, data: [mockTheater] })
    })
  })

  describe("fetching bookings",() => {
    it("should fetch booking by userId", async () => {
        let userId = "userid123";
        let mockBooking = {
            booking_id: "booking123",
            theater_name: "Sun Theater",
            movie_name: "Devara",
            time: "10:00",
            price: "130",
            date: "2024-09-09",
            seats_count: 3,
          };

        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockBooking]]);

        const result = await User.getBookings(userId);

        expect(result).toEqual({ status: StatusCodes.OK, data: [mockBooking] })
    })
  })

  describe("fetching theater time movie id",() => {
    it("should fetch theater time movie id by theaterMovieId and time", async () => {
        let mockData = {theater_movie_time_id:"theatermovietimeid"};
        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockData]]);

        const result = await User.getTheaterTimeMovieId("theatermovieid", "10:00");
        
        expect(mockPool.query).toHaveBeenCalledWith("select theater_movie_time_id from theater_movie_time where theater_movie_id = ? and time = ?",["theatermovieid", "10:00"]);
        expect(result).toEqual({ status: StatusCodes.OK, data: [mockData] })
    })
  })

  describe("fetching seats",() => {
    it("should fetch seats by theaterMovieTimeId", async () => {
        let mockSeat = {
            seat_id: "seat123",
            theater_movie_time_id: "theater1movie2time10",
            seat_number: 12,
            status_id: 1,
          };
        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockSeat]]);

        const result = await User.getSeats("theater1movie2time10");
        
        expect(mockPool.query).toHaveBeenCalledWith("select * from seat where theater_movie_time_id = ?",["theater1movie2time10"]);
        expect(result).toEqual({ status: StatusCodes.OK, data: [mockSeat] })
    })
  })

  describe("fetching movies by Genre",() => {
    it("should fetch movies by genre", async () => {
        let mockMovie = {
            movie_id: "movie_id",
            movie_name: "The Spider of Spiderweb Canyon",
            description:
              "A woman making a video in a forest encounters a strange stranger.",
            duration: "00:11:00",
            rating: "8.00",
            genre: "drama, Sci-Fi",
            poster_url:
              "https://m.media-amazon.com/images/M/MV5BMjFkYWIxNWUtMjVmOS00ZWVjLWJlNzktMzNhMjhkNWQ0YzJkXkEyXkFqcGdeQXVyMTI5NjMxOTQ@._V1_SX300.jpg",
            actors: "Andra Beatty, Allison Roper",
            release_date: "2024-1-01",
            language: "English",
            director: "S.W. Hannan",
          };
        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockMovie]]);

        const result = await User.getMoviesByGenre("drama");
        
        expect(mockPool.query).toHaveBeenCalledWith("select * from movie where genre like '%drama%'");
        expect(result).toEqual({ status: StatusCodes.OK, data: [mockMovie] })
    })
  })