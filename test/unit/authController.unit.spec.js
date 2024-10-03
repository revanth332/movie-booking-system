import User from "../../src/app/v1/models/user.model.js";
import { loginPublisher, registerTheater } from "../../src/app/v1/controllers/publisher.controller.js";
import { loginUser, registerUser } from "../../src/app/v1/controllers/user.controller.js";
import pkg from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { closeConnection } from "../../src/app/v1/utils/dbConnection.js";
import Publisher from "../../src/app/v1/models/publisher.model.js";
import config from "../../config.js";

afterAll(async () => {
    await closeConnection();
})

describe("authController tests",() => {
    describe("Publihser registration",() => {
        let mockReq,mockRes,mockTheater;
        mockTheater = {
          theaterName:"Sun Theater",
          email:"suntheater@gmail.com",
          phone:"1234567890",
          capacity:"140",
          city:"Vizag",
          theaterAddress:"Near Ramalayam",
          password:"theaterpassword@123",
        }
        beforeEach(() => {
          mockReq = { body: mockTheater },
          mockRes = {status : jest.fn().mockReturnThis(),send:jest.fn()}
        })
    
        it("should register Theater successfully", async () => {
          jest.spyOn(Publisher,"registerTheater").mockResolvedValueOnce({
            status: StatusCodes.OK,
            msg: "Successfully added Theater",
            data: { theaterId:"theater123", theaterName:"Sun Theater" },
          })
  
          jest.spyOn(pkg,"sign").mockResolvedValueOnce("theatertoken123");
          jest.spyOn(bcrypt,"genSalt").mockResolvedValueOnce("salt")
          jest.spyOn(bcrypt,"hash").mockResolvedValueOnce("hashedpassword");
    
          mockTheater = {...mockTheater,password:"hashedpassword"};
     
          await registerTheater(mockReq,mockRes);
    
          expect(Publisher.registerTheater).toHaveBeenCalledWith(mockTheater);
          expect(bcrypt.genSalt).toHaveBeenCalledWith(5)
          expect(bcrypt.hash).toHaveBeenCalledWith("theaterpassword@123","salt")
          expect(pkg.sign).toHaveBeenCalledWith({ userId: "theater123" }, config.SECRET_KEY, {
              expiresIn: "1d",
            })
          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.send).toHaveBeenCalledWith({theaterId:"theater123",theaterName:"Sun Theater",token:"theatertoken123",role:"publisher"});
        })
  
        it("should throw error while registering Theater", async () => {
          jest.spyOn(Publisher,"registerTheater").mockRejectedValueOnce(new Error("An error occurred"))
  
          jest.spyOn(bcrypt,"genSalt").mockResolvedValueOnce("salt")
          jest.spyOn(bcrypt,"hash").mockResolvedValueOnce("hashedpassword");
    
          mockTheater = {...mockTheater,password:"hashedpassword"};
    
          await registerTheater(mockReq,mockRes);
    
          expect(Publisher.registerTheater).toHaveBeenCalledWith(mockTheater);
          expect(bcrypt.genSalt).toHaveBeenCalledWith(5)
          expect(bcrypt.hash).toHaveBeenCalledWith("theaterpassword@123","salt")
          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.send).toHaveBeenCalledWith("An error occurred");
        })
      })
  
      describe("Publisher Signin",() => {
          let mockReq,mockRes;
          beforeEach(() => {
            mockReq = { body: {phone : "1234567890",password:"theaterpassword"} },
            mockRes = {status : jest.fn().mockReturnThis(),send:jest.fn()}
          })
  
          it("should login publisher successfully", async () => {
              jest.spyOn(Publisher,"loginPublisher").mockResolvedValueOnce({
                  status: StatusCodes.OK,
                  msg: "Login Successful",
                  theaterId: "theater123",
                  theaterName: "Sum Theater",
              })
              jest.spyOn(pkg,"sign").mockResolvedValueOnce("theatertoken123");
  
              await loginPublisher(mockReq,mockRes);
  
              expect(Publisher.loginPublisher).toHaveBeenCalledWith({phone : "1234567890",password:"theaterpassword"});
              expect(pkg.sign).toHaveBeenCalledWith({ userId: "theater123" }, config.SECRET_KEY, {
                  expiresIn: "1d",
              })
              expect(mockRes.status).toHaveBeenCalledWith(200);
              expect(mockRes.send).toHaveBeenCalledWith({
                  msg: "Login Successful",
                  token:"theatertoken123",
                  theaterName: "Sum Theater",
                  theaterId: "theater123",
                  role:"publisher"
                });
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
          expect(pkg.sign).toHaveBeenCalledWith({ userId: "abcd" }, config.SECRET_KEY, {
            expiresIn: "1d",
          })
          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.send).toHaveBeenCalledWith({
            userId: "abcd",
            userName: "Ravani",
            token:"token",
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
})