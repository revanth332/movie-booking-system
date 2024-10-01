
// jest.mock("../src/app/v1/utils/dbConnection.js")

import { StatusCodes } from "http-status-codes";
import { closeConnection } from "../../src/app/v1/utils/dbConnection.js";
import Publisher from "../../src/app/v1/models/publisher.model.js";


import {
  addMovie,
  cancelPublishedMovie,
  getPublishedMovies
} from "../../src/app/v1/controllers/publisher.controller.js";

afterAll(async () => {
  await closeConnection();
});

describe("Publisher controller", () => {
  describe("adding Movie", () => {
    let mockReq, mockRes, mockMovie;
    mockMovie = {
      imdbID: "tt123456",
      theaterId: "theater123",
      price: "140",
      date: "2024-09-09",
      time: ["10:00", "09:00"],
    };
    beforeEach(() => {
      (mockReq = { body: mockMovie }),
        (mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() });
    });

    it("should add movie successfully", async () => {
      jest
        .spyOn(Publisher, "addMovie")
        .mockResolvedValueOnce({
          status: StatusCodes.OK,
          msg: "Successfully added movie",
        });

      await addMovie(mockReq, mockRes);

      expect(Publisher.addMovie).toHaveBeenCalledWith(mockMovie);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("Successfully added movie");
    });

    it("should throw error while adding movie", async () => {
      jest
        .spyOn(Publisher, "addMovie")
        .mockRejectedValueOnce(new Error("An error occured"));

      await addMovie(mockReq, mockRes);

      expect(Publisher.addMovie).toHaveBeenCalledWith(mockMovie);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("An error occured");
    });
  });

  describe("helper date and time formatting fucntions", () => {
    it("should convert 24 hour format intp 12 hour format", () => {
      const converted = Publisher.convertTo12HourFormat("18:00");
      expect(converted).toBe("6:00 PM");
    });

    it("should format dd mm year into  yyyy-mm-dd format", () => {
      const converted = Publisher.formatDate("12 Jan 2024");
      expect(converted).toBe("2024-1-12");
    });

    it("should convert minutes intp hh:mm format", () => {
      const converted = Publisher.formatTime("120 mm");
      expect(converted).toBe("02:00");
    });

    it("should find weather a character is alphabetic or not", () => {
      const converted = Publisher.isAlphabetic("s");
      expect(converted).toBe(true);
    });
  });

  describe("fetching Published Movies", () => {
    let mockReq, mockRes, mockMovie;
    mockMovie = {
      theater_movie_time_id: "11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
      movie_name: "The Spider of Spiderweb Canyon",
      description:
        "A woman making a video in a forest encounters a strange stranger.",
      price: "140",
      date: "2024-09-09",
      time: "10:00",
      theater_movie_id: "33f03b7a-6190-4476-bf9d-f6ab782036cc",
      movie_id: "tt31322250",
    };
    beforeEach(() => {
      mockReq = { query: { theaterId: "theater123" } };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    it("should fetch published movies successfully", async () => {
      jest
        .spyOn(Publisher, "getPublishedMovies")
        .mockResolvedValueOnce({ status: StatusCodes.OK, data: [mockMovie] });

      await getPublishedMovies(mockReq, mockRes);

      expect(Publisher.getPublishedMovies).toHaveBeenCalledWith("theater123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([mockMovie]);
    });

    it("should throw error while fetching published movies", async () => {
      jest
        .spyOn(Publisher, "getPublishedMovies")
        .mockRejectedValueOnce(new Error("An error occured"));

      await getPublishedMovies(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("Failed to fetch movies");
    });
  });

  describe("cancellinng published movie", () => {
    let mockReq,mockRes,mockQuery;
    // beforeAll(async () => {
    //   // Create a mock pool object
    //   const mockPool = {
    //     query: jest.fn(),
    //   };
    //   mockQuery = mockPool.query; // Reference the mock query function
    // });
    beforeEach(async () => {
      mockReq = {
        query: {
          theaterMovieTimeId: "11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
          theaterMovieId: "33f03b7a-6190-4476-bf9d-f6ab782036cc",
          movieId: "tt31322250",
          date: "2024-09-09",
        },
      };
      mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    });

    it("should cancel published movie successfully", async () => {
      jest
        .spyOn(Publisher, "cancelPublishedMovie")
        .mockResolvedValueOnce({
          status: StatusCodes.OK,
          msg: "Show deleted successfully",
        });

      // mockQuery.mockResolvedValueOnce([{ booking_:1 }]);
      await cancelPublishedMovie(mockReq, mockRes);

      expect(Publisher.cancelPublishedMovie).toHaveBeenCalledWith(
        "11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
        "2024-09-09",
        "33f03b7a-6190-4476-bf9d-f6ab782036cc",
        "tt31322250"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("Show deleted successfully");
    });

    it("should throw error while cancelling published movie", async () => {
      jest
        .spyOn(Publisher, "cancelPublishedMovie")
        .mockRejectedValueOnce(new Error("An error occured"));

      await cancelPublishedMovie(mockReq, mockRes);

      expect(Publisher.cancelPublishedMovie).toHaveBeenCalledWith(
        "11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
        "2024-09-09",
        "33f03b7a-6190-4476-bf9d-f6ab782036cc",
        "tt31322250"
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("Failed to fetch movies");
    });
  });

});



////////////////////////////////////////////


// import { poolPromise } from "../src/app/v1/utils/dbConnection.js";
// // import Publisher from "../publisher.model.js";
// import nodemailer from "nodemailer";

// jest.mock("../src/app/v1/utils/dbConnection.js");
// jest.mock("nodemailer");

// describe("Publisher Model - cancelPublishedMovie", () => {
//   let mockPool;

//   beforeAll(async () => {
//     mockPool = await poolPromise;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test.only("should cancel published movie and send email if booking exists", async () => {
//     const theaterMovieTimeId = "1";
//     const date = "2023-01-01";
//     const theaterMovieId = "1";
//     const movieId = "1";

//     // Mocking the database responses
//     jest.spyOn(mockPool,"query")
//       .mockResolvedValueOnce([{ email: "user@example.com", booking_id: "123" }]) // for booking query
//       .mockResolvedValueOnce([
//         {
//           theater_name: "Test Theater",
//           movie_name: "Test Movie",
//           date: new Date(),
//           time: "12:00",
//         },
//       ]) // for ticket query
//       .mockResolvedValueOnce([{ count: 0 }]) // for count of theater_movie
//       .mockResolvedValueOnce([{ count: 0 }]); // for count of movie

//     nodemailer.createTransport.mockReturnValue({
//       sendMail: jest.fn((mailDetails, callback) => {
//         callback(null, "Email sent");
//       }),
//     });

//     const response = await Publisher.cancelPublishedMovie(
//       theaterMovieTimeId,
//       date,
//       theaterMovieId,
//       movieId
//     );

//     expect(response).toEqual({ status: 200, msg: "Show deleted successfully" });
//     expect(mockPool.query).toHaveBeenCalledTimes(4); // Ensure all queries were called
//     expect(nodemailer.createTransport().sendMail).toHaveBeenCalled(); // Ensure email was sent
//   });

//   test("should delete theater_movie_time without sending email if no booking exists", async () => {
//     const theaterMovieTimeId = "1";
//     const date = "2023-01-01";
//     const theaterMovieId = "1";
//     const movieId = "1";

//     // Mocking the database responses
//     mockPool.query
//       .mockResolvedValueOnce([]) // No booking found
//       .mockResolvedValueOnce([{ count: 1 }]) // for count of theater_movie
//       .mockResolvedValueOnce([{ count: 0 }]); // for count of movie

//     const response = await Publisher.cancelPublishedMovie(
//       theaterMovieTimeId,
//       date,
//       theaterMovieId,
//       movieId
//     );

//     expect(response).toEqual({ status: 200, msg: "Show deleted successfully" });
//     expect(mockPool.query).toHaveBeenCalledTimes(3); // Ensure all queries were called
//     expect(nodemailer.createTransport().sendMail).not.toHaveBeenCalled(); // Ensure email was not sent
//   });

//   test("should throw an error if an exception occurs", async () => {
//     const theaterMovieTimeId = "1";
//     const date = "2023-01-01";
//     const theaterMovieId = "1";
//     const movieId = "1";

//     // Mocking the database responses to throw an error
//     mockPool.query.mockRejectedValue(new Error("Database error"));

//     await expect(
//       Publisher.cancelPublishedMovie(
//         theaterMovieTimeId,
//         date,
//         theaterMovieId,
//         movieId
//       )
//     ).rejects.toEqual({ status: 500, msg: "An error occurred" });
//   });
// });
