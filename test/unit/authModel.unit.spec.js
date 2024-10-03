import User from "../../src/app/v1/models/user.model";
import { StatusCodes } from "http-status-codes";
import {
  closeConnection,
  poolPromise,
} from "../../src/app/v1/utils/dbConnection.js";
import mysql from "mysql2/promise";
import config from "../../config.js";
import * as uuid from "uuid";

const DbConfig = {
  host: config.DATABASE_HOST,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  port: config.DATABASE_PORT,
};

// jest.mock("mysql2/promise");
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

var mockPool;

beforeAll(async () => {
  mockPool = await poolPromise;
})

afterAll(async () => {
  await closeConnection();
});

describe("User Model", () => {
  describe("findUser", () => {
    let mockUserId;
    beforeEach(() => {
      mockUserId = "0984708e-aa79-414b-8dab";
    })

    it("should find a user", async () => {

      jest.spyOn(mockPool,"query").mockResolvedValueOnce([[{user_id:mockUserId}]])

      const result = await User.findUser(mockUserId);
      expect(mockPool.query).toHaveBeenCalledWith("select user_id from user where user_id = ?", [mockUserId]);
      expect(result).toEqual({ status: StatusCodes.OK, msg: "user found" });
    });

    it("should not find a user", async () => {
      jest.spyOn(mockPool,"query").mockResolvedValueOnce([[]])
      const result = await User.findUser(mockUserId);

      expect(mockPool.query).toHaveBeenCalledWith("select user_id from user where user_id = ?", [mockUserId]);
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
        firstName:"Ravani",
        lastName:"Lanka",
        phone:"9959965977",
        email:"ravani@gmail.com",
        password:"Moye@321"
      }
    })

    it.only("should resgiter user",async () => {
      jest.spyOn(mockPool,"query").mockResolvedValueOnce();
      jest.spyOn(uuid,"v4").mockReturnValueOnce("useruuid")

      const result = await User.registerUser(mockUser);

      expect(uuid.v4).toHaveBeenCalled()
      expect(mockPool.query).toHaveBeenCalledWith("insert into user values(?,?,?,?,?,?)", ["useruuid",...Object.values(mockUser)])
      expect(result).toEqual({
        status: StatusCodes.OK,
        msg: "Successfully added User",
        data: { userId: "useruuid", userName : mockUser.firstName },
      })
    })
  })

});
