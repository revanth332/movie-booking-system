import passport from "passport";
import passportJWT from "passport-jwt";
import express from 'express';
import config from "../../../config.js";

const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;

const app = express();

//routers
import userRouter from '../v1/routes/user.router.js'
import movieRouter from '../v1/routes/movie.router.js'

//defining the JWT strategy
const passportStrategy = new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SECRET_KEY  // secret key 
}, (jwt_payload, next) => {
    // console.log(jwt_payload)
    next(null, jwt_payload)
});

//init passport strategy
passport.use(passportStrategy);

//handle browser options Request
const handleOptionsReq = (req, res, next) => {
    if (req.method === 'OPTIONS') { 
        res.send(200);
    } else { 
        next();
    }
}

app.use('/user',userRouter)
app.use('/movie',passport.authenticate('jwt', { session: false }),movieRouter);

export default app;
