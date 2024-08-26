import passport from "passport";
import passportJWT from "passport-jwt";
import express from "express";
import config from "../../../config.js";
import { StatusCodes } from "http-status-codes";
const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const app = express();

//routers
import userRouter from "../v1/routes/user.router.js";
import publisherRouter from "../v1/routes/publisher.router.js";
import authRouter from "../v1/routes/auth.router.js";
import Publisher from "./models/publisher.model.js";
import User from "./models/user.model.js";
import { getMovies } from "./controllers/user.controller.js";

//defining the JWT strategy
const passportStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SECRET_KEY, // secret key
  },
  async (jwt_payload, next) => {
    console.log(jwt_payload);
    const { userId } = jwt_payload;
    try {
      var response = await User.findUser(userId);
      if (response.status !== 200) {
        response = await Publisher.findPublisher(userId);
        if (response.status === 200) next(null, { userId, type: "publisher" });
      }
      else next(null, { userId, type: "user" });
    } catch (err) {
      console.log(err);
      next(null, false);
    }
  }
);

//init passport strategy
passport.use(passportStrategy);

//handle browser options Request
const handleOptionsReq = (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
};

app.post("/test", (req, res) => {
  res.send(req);
});

app.use("/auth", authRouter);
app.use("/user", passport.authenticate("jwt", { session: false }), userRouter);
app.use(
  "/publisher",
  passport.authenticate("jwt", { session: false }),
  publisherRouter
);

app.get("/getTrendingMovies", async (req, res) => {
  try {
    const response = await User.getTrendingMovies();
    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.status) {
      res.status(err.status).send(err.message);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An error occurred");
    }
  }
});
// app.use('/movie',passport.authenticate('jwt', { session: false }),movieRouter);

export default app;
