import request from "supertest";
import User from "../src/app/v1/models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { response } from "express";
import { getMovies,loginUser } from "../src/app/v1/controllers/user.controller.js";
// import bcrypt from 'bcrytjs';

const mockRequest = () => {
  return {
    body:{},
    query: {},
    params:{},
    user:{}
  }
}

const mockResponse = () => {
  return {
    status:jest.fn().mockReturnThis(),
    send:jest.fn()
  }
}

describe("user conroller",() => {

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
  
    it("should fetch movies",async () => {
      jest.spyOn(User,"getMovies").mockResolvedValueOnce({status:200,data:[mockMovie]});
  
      const mockReq = mockRequest();
      const mockRes = mockResponse();
  
      await getMovies(mockReq,mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith([mockMovie])
    })
  })

  describe("user login",() => {
    test('should login successfully', async () => {
      // Mock the User.loginUser method to return a successful response
      jest.spyOn(User,"loginUser").mockResolvedValueOnce({
        status: 200,
        msg: 'Login successful',
        userId: 1,  
        userName: 'testUser',
        role: 'admin'
      });
    
      const mockReq = { body: { username: 'testUser', password: 'password' } };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    
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
      // Mock the User.loginUser method to throw an error
      User.loginUser.mockRejectedValueOnce({ status: 400, msg: 'Invalid credentials' });
    
      const mockReq = { body: { username: 'testUser', password: 'password' } };
      const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    
      await loginUser(mockReq, mockRes);
    
      expect(User.loginUser).toHaveBeenCalledWith({ username: 'testUser', password: 'password' });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Invalid credentials');
    });

  })

})


