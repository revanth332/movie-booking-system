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

const DbConfig = {
  host: config.DATABASE_HOST,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  port: config.DATABASE_PORT,
};

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

    it("should fail to register user with missing data", async () => {
      jest.spyOn(mockPool, "query").mockResolvedValueOnce();
      jest.spyOn(uuid, "v4").mockReturnValueOnce("useruuid");

      const incompleteUser = {
        firstName: "Ravani",
        lastName: "Lanka",
        phone: "9959965977",
        email: "ravani@gmail.com",
        password: "",
      };

      try {
        await User.registerUser(incompleteUser);
      } catch (err) {
        expect(uuid.v4).not.toHaveBeenCalled();
        expect(mockPool.query).not.toHaveBeenCalled();
        expect(err).toEqual({
          status: StatusCodes.BAD_REQUEST,
          message: "incomplete fields",
        });
      }
    });
  });

  describe("login user", () => {
    let mockUser;
    beforeEach(() => {
      mockUser = { phone: "1234567890", password: "theaterpassword" };
    });
    it("should login user", async () => {
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
        ["9959965977"]
      );
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        "Moye@321",
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
      jest.spyOn(mockPool, "query").mockResolvedValueOnce([
        {
          user_id: "useruuid",
          password: "hashedpassword",
          first_name: "Ravani",
        },
      ]);
      const mockBcryptCompare = jest
        .spyOn(bcrypt, "compare")
        .mockResolvedValueOnce(false);

      try {
        await User.loginUser(mockUser);
      } catch (err) {
        expect(mockPool.query).toHaveBeenCalledWith(
          "select user_id,password,first_name from user where phone = ?",
          ["9959965977"]
        );
        expect(mockBcryptCompare).toHaveBeenCalledWith(
          "Moye@321",
          "hashedpassword"
        );
        expect(err).toEqual({
          status: StatusCodes.NOT_FOUND,
          msg: "Invalid credentials",
        });
      }
    });
  });

  // it("should login publisher", async () => {
  //   jest.spyOn(mockPool, "query").mockResolvedValueOnce([]).mockResolvedValueOnce([{ theater_id: "theateruuid", password: "hashedpassword", theater_name: "Theater Name" }]);
  //   const mockBcryptCompare = jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false).mockResolvedValueOnce(true);

  //   const result = await User.loginUser({ phone: "9959965977", password: "Moye@321" });

  //   expect(mockPool.query).toHaveBeenNthCalledWith(1, "select user_id,password,first_name from user where phone = ?", ["9959965977"]);
  //   expect(mockPool.query).toHaveBeenNthCalledWith(2, "select theater_id,password,theater_name from theater where phone = ?", ["9959965977"]);
  //   expect(mockBcryptCompare).toHaveBeenNthCalledWith(1, "Moye@321", "hashedpassword");
  //   expect(mockBcryptCompare).toHaveBeenNthCalledWith(2, "Moye@321", "hashedpassword");
  //   expect(result).toEqual({
  //     status: StatusCodes.OK,
  //     msg: "Login Successful",
  //     userId: "theateruuid",
  //     userName: "Theater Name",
  //     role: "publisher",
  //   });
  // });
});
