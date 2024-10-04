import User from "../../src/app/v1/models/user.model";
import { StatusCodes } from "http-status-codes";
import {
  closeConnection,
  poolPromise,
} from "../../src/app/v1/utils/dbConnection.js";
import mysql from "mysql2/promise";
import config from "../../config.js";
import * as uuid from "uuid";
import bcrypt from "bcryptjs";
import Publisher from "../../src/app/v1/models/publisher.model.js";

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

describe("User Model", () => {
  describe("findUser", () => {
    let mockUserId;
    beforeEach(() => {
      mockUserId = "0984708e-aa79-414b-8dab";
    });

    it("should find a user", async () => {
      jest
        .spyOn(mockPool, "query")
        .mockResolvedValueOnce([[{ user_id: mockUserId }]]);

      const result = await User.findUser(mockUserId);
      expect(mockPool.query).toHaveBeenCalledWith(
        "select user_id from user where user_id = ?",
        [mockUserId]
      );
      expect(result).toEqual({ status: StatusCodes.OK, msg: "user found" });
    });

    it("should not find a user", async () => {
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([[]]);
      const result = await User.findUser(mockUserId);

      expect(mockPool.query).toHaveBeenCalledWith(
        "select user_id from user where user_id = ?",
        [mockUserId]
      );
      expect(result).toEqual({
        status: StatusCodes.NOT_FOUND,
        msg: "user not found",
      });
    });
  });

  describe("registering User", () => {
    let mockUser;
    beforeEach(() => {
      mockUser = {
        firstName: "Ravani",
        lastName: "Lanka",
        phone: "9959965977",
        email: "ravani@gmail.com",
        password: "Moye@321",
      };
    });

    it("should register user", async () => {
      jest.spyOn(mockPool, "query").mockResolvedValueOnce();
      jest.spyOn(uuid, "v4").mockReturnValueOnce("useruuid");

      const result = await User.registerUser(mockUser);

      expect(uuid.v4).toHaveBeenCalled();
      expect(mockPool.query).toHaveBeenCalledWith(
        "insert into user values(?,?,?,?,?,?)",
        ["useruuid", ...Object.values(mockUser)]
      );
      expect(result).toEqual({
        status: StatusCodes.OK,
        msg: "Successfully added User",
        data: { userId: "useruuid", userName: mockUser.firstName },
      });
    });

    // it("should fail to register user with missing data", async () => {
    //   jest.spyOn(mockPool, "query").mockResolvedValueOnce();
    //   jest.spyOn(uuid, "v4").mockReturnValueOnce("useruuid");

    //   const incompleteUser = {
    //     firstName: "Ravani",
    //     lastName: "Lanka",
    //     phone: "9959965977",
    //     email: "ravani@gmail.com",
    //     password: "",
    //   };

    //   try {
    //     await User.registerUser(incompleteUser);
    //   } catch (err) {
    //     expect(uuid.v4).not.toHaveBeenCalled();
    //     expect(mockPool.query).not.toHaveBeenCalled();
    //     expect(err).toEqual({
    //       status: StatusCodes.BAD_REQUEST,
    //       message: "incomplete fields",
    //     });
    //   }
    // });
  });

  describe("login user", () => {
    it("should login user", async () => {
      let mockUser = { phone: "1234567890", password: "theaterpassword" };
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([
        [
          {
            user_id: "useruuid",
            password: "hashedpassword",
            first_name: "Ravani",
          }
        ],
      ]);
      const mockBcryptCompare = jest
        .spyOn(bcrypt, "compare")
        .mockResolvedValueOnce(true);

      const result = await User.loginUser(mockUser);

      expect(mockPool.query).toHaveBeenCalledWith(
        "select user_id,password,first_name from user where phone = ?",
        ["1234567890"]
      );
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        "theaterpassword",
        "hashedpassword"
      );
      expect(result).toEqual({
        status: StatusCodes.OK,
        msg: "Login Successful",
        userId: "useruuid",
        userName: "Ravani",
        role: "user",
      });
    });

    it("should fail to login user with invalid credentials", async () => {
      let mockUser = { phone: "1234567890", password: "" };
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([[
        {
          user_id: "useruuid",
          password: "hashedpassword",
          first_name: "Ravani",
        },
      ]]);
      try {
        await User.loginUser(mockUser);
      } catch (err) {
        expect(err).toEqual({status:StatusCodes.BAD_REQUEST,message:"empty field error"});
      }
    });
  });

  // describe("login publisher",() => {
  //   it("should login publisher", async () => {
  //     jest.spyOn(mockPool, "query").mockResolvedValueOnce([[]]).mockResolvedValueOnce([[{ theater_id: "theateruuid", password: "hashedpassword", theater_name: "Theater Name" }]]);
  //     jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true)
  
  //     const result = await User.loginUser({ phone: "1234567890", password: "theaterpassword" });
  
  //     // expect(mockPool.query).toHaveBeenCalledWith("select user_id,password,first_name from user where phone = ?", ["1234567890"]);
  //     // expect(mockPool.query).toHaveBeenCalledWith("select user_id,password,first_name from theater where phone = ?", ["1234567890"]);
  //     // expect(bcrypt.compare).toHaveBeenCalledWith("theaterpassword", "hashedpassword");
  //     expect(result).toEqual({
  //       status: StatusCodes.OK,
  //       msg: "Login Successful",
  //       userId: "theateruuid",
  //       userName: "Theater Name",
  //       role: "publisher",
  //     });
  //   });
  
  //   it("should fail to login publisher", async () => {
  //     jest.spyOn(mockPool, "query").mockResolvedValueOnce([[]]).mockResolvedValueOnce([[{ theater_id: "theateruuid", password: "hashedpassword", theater_name: "Theater Name" }]]);
  //     jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true)
  
  //     try{
  //       await User.loginUser({ phone: "1234567890", password: "" });
  //     }
  //     catch(err){
  //       expect(err).toEqual({
  //         message: "empty field error",
  //         status: 400,
  //       });
  //     }
  //     // expect(mockPool.query).toHaveBeenCalledWith("select user_id,password,first_name from user where phone = ?", ["1234567890"]);
  //     // expect(mockPool.query).toHaveBeenCalledWith("select user_id,password,first_name from theater where phone = ?", ["1234567890"]);
  //     // expect(bcrypt.compare).toHaveBeenCalledWith("theaterpassword", "hashedpassword");
  //   });
  // })

  describe("register theater",() => {

    it("should register theater", async () => {
      let mockTheater = {
        theaterName : "theaterName",
        email : "email",
        phone : "phone",
        capacity : "capacity",
        city : "city",
        theaterAddress : "theaterAddress",
        password : "password"
      }

      jest.spyOn(mockPool, "query").mockResolvedValueOnce([{}]);
      jest.spyOn(uuid, "v4").mockReturnValueOnce("theateruuid");

      const result = await Publisher.registerTheater(mockTheater);

      expect(result).toEqual({
        status: StatusCodes.OK,
        msg: "Successfully added Theater",
        data: { theaterId:"theateruuid", theaterName:"theaterName" },
      })
    })

    it("should fail to register theater", async () => {
      let mockTheater = {
        theaterName : "theaterName",
        email : "email",
        phone : "phone",
        capacity : "capacity",
        city : "city",
        theaterAddress : "theaterAddress",
        password : ""
      }

      jest.spyOn(mockPool, "query").mockResolvedValueOnce([{}]);
      jest.spyOn(uuid, "v4").mockReturnValueOnce("theateruuid");

      try{
        await Publisher.registerTheater(mockTheater);
      }
      catch(err){
        expect(err).toEqual({status: StatusCodes.BAD_REQUEST, msg: "empty field error"})
      }
    })
  })

});
