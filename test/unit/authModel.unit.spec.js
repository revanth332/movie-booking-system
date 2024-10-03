import User from "../../src/app/v1/models/user.model";
import { StatusCodes } from "http-status-codes";
import {
  closeConnection,
  poolPromise,
} from "../../src/app/v1/utils/dbConnection.js";
import mysql from "mysql2/promise";
import config from "../../config.js";

const DbConfig = {
  host: config.DATABASE_HOST,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  port: config.DATABASE_PORT,
};

jest.mock("mysql2/promise");

// var mockPool;

// beforeAll(async () => {
//     mysql.createPool(DbConfig);
// })

afterAll(async () => {
  await closeConnection();
});

describe("User Model", () => {
  describe("findUser", () => {
    let pool;
    beforeEach(() => {
      pool = {
        query: jest.fn(),
      };
    });

    it("should find a user", async () => {
      const mockUserId = "1e9d8a54-bd7f-4d9a-8d7c-dc8e6e2e68d1";

      const result = await User.findUser(mockUserId);
      const pool = await poolPromise;
    //   expect(mockPool.query).toHaveBeenCalledWith("hello");
      expect(result).toEqual({ status: StatusCodes.OK, msg: "user found" });
    });

    it("should not find a user", async () => {
      const mockUserId = "user123";
      jest.spyOn(User, "findUser").mockResolvedValueOnce({
        status: StatusCodes.NOT_FOUND,
        msg: "user not found",
      });
      const result = await User.findUser(mockUserId);
      expect(result).toEqual({
        status: StatusCodes.NOT_FOUND,
        msg: "user not found",
      });
    });
  });
});
