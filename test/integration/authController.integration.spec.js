import express from 'express';
import request from 'supertest';
import userRouter from '../../src/app/v1/routes/user.router.js'
import authRouter from '../../src/app/v1/routes/auth.router.js'
import { closeConnection } from "../../src/app/v1/utils/dbConnection.js";


const app = express();

app.use(express.json());

app.use("/auth",authRouter)

afterAll(async () => {
    await closeConnection();
})

describe("auth controller integration test",() => {

    describe("user register API", () => {
        it("POST /v1/auth/registerUser - success",() => {
            return request(app)
                .post("/auth/registerUser")
                .send({firstName:"Ravani",
                    lastName:"Lanka",
                    phone:"9959965977",
                    email:"ravani@gmail.com",
                    password:"Moye@321"})
                .expect(200)
        })
    
        it("POST /v1/auth/registerUser - failure",() => {
            return request(app)
                .post("/auth/registerUser")
                .send({firstName:"",
                    lastName:"Lanka",
                    phone:"9959965977",
                    email:"ravani@gmail.com",
                    password:"Moye@321"})
                .expect(500)
        })
    })

    describe("user login API", () => {
        it("POST /v1/auth/loginUser - success",() => {
            return request(app)
                .post("/auth/loginUser")
                .send({
                    "phone":"1234567890",
                    "password":"hashedpassword1"
                })
                .expect(200)
        })
    
        it("POST /v1/auth/loginUser - failure",() => {
            return request(app)
                .post("/auth/loginUser")
                .send({
                    "phone":"12345678",
                    "password":"hashedpassword1"
                })
                .expect(404)
        })
    })

    describe("publisher register API", () => {
        it("POST /v1/auth/registerTheater - success",() => {
            return request(app)
                .post("/auth/registerTheater")
                .send({
                    "theaterName":"Ranjani BIG Cinemas",
                    "theaterAddress":"Ranjani Rd, Ayodya Maidanam Area, Jonnaguddi Area, Vizianagaram, Andhra Pradesh 535202",
                    "email":"ranjani@gmail.com",
                    "phone":"7016862290",
                    "password":"Theater3@321",
                    "capacity":5,
                    "state":"Andhra Pradesh",
                    "city":"Vizag"
                })
                .expect(200)
        })
    
        it("POST /v1/auth/registerTheater - failure",() => {
            return request(app)
                .post("/auth/registerTheater")
                .send({
                    "theaterName":"",
                    "theaterAddress":"Ranjani Rd, Ayodya Maidanam Area, Jonnaguddi Area, Vizianagaram, Andhra Pradesh 535202",
                    "email":"ranjani@gmail.com",
                    "phone":"7016862290",
                    "password":"Theater3@321",
                    "capacity":5,
                    "state":"Andhra Pradesh",
                    "city":"Vizag"
                })
                .expect(500)
        })
    })

    describe("publisher login API", () => {
        it("POST /v1/auth/loginPublisher - success",() => {
            return request(app)
                .post("/auth/loginPublisher")
                .send({
                    "phone":"7016862290",
                    "password":"Theater3@321"
                })
                .expect(200)
        })
    
        it("POST /v1/auth/loginPublisher - failure",() => {
            return request(app)
                .post("/auth/loginPublisher")
                .send({
                    "phone":"12345678",
                    "password":"hashedpassword1"
                })
                .expect(409)
        })
    })

})