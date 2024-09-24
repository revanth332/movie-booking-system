import request from "supertest";
import User from "../src/app/v1/models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { response } from "express";
// import bcrypt from 'bcrytjs';


describe("registerUser API", () => {
  let mockUser = {
      firstName: "Revanth",
      lastName: "Lanka",
      phone: "1234567890",
      email: "test@gmail.com",
      password: "password",
    };

    jest.spyOn(User,"registerUser").mockResolvedValueOnce();
    // jest.spyOn(bcrypt,"hash").mockResolvedValueOnce()

  it("should register a user successfully with a valid request", async () => {
    // Mock successful user registration
    User.registerUser.mockResolvedValueOnce({ data: mockUser });
    // bcrypt.hash.mockResolvedValueOnce("hashedPassword");

    await User.registerUser(mockUser);

    // expect(response.status).toBe(StatusCodes.OK);
    // expect(response.body).toEqual({
    //   userId: "mockUser.theaterId",
    //   userName: mockUser.userName,
    //   token: expect.any(String),
    //   role: "user",
    // });

    // Verify user registration was called with expected data
    // expect(User.registerUser).toHaveBeenCalledWith({
    //   ...mockUser,
    //   password: "hashedPassword", // Verify hashed password passed
    // });
  });
});

describe("fetch Movies", () => {
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

  jest.spyOn(User,"getMovies").mockResolvedValueOnce();

  it("should fetch movies",async () => {
    await User.getMovies().mockResolvedValueOnce();

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body)
  })
})
