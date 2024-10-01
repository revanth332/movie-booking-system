import express from 'express';
import request from 'supertest';
import userRouter from '../../src/app/v1/routes/user.router.js'
import { closeConnection } from "../../src/app/v1/utils/dbConnection.js";


const app = express();

app.use(express.json());

app.use("/user",userRouter)

afterAll(async () => {
    await closeConnection();
})

describe("user controller integration test",() => {
    describe("fetching movies",() => {
        it("GET /v1/user/getMovies - Success",async () => {
            return request(app)
                .get("/user/getMovies")
                .expect('Content-Type',/json/)
                .expect(200)
        })
    })

    describe("booking a movie", () => {
        it("GET /v1/user/bookMovie - Success", async () => {
            return request(app)
                .post("/user/bookMovie")
                .send({
                    userId:"0b37cef7-bedd-4b37-bfc4-21bd3eee7616",
                    theaterTimeMovieId:"11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
                    seats:["59a61c99-76b6-11ef-adac-8cec4bc9914d","59a62167-76b6-11ef-adac-8cec4bc9914d"]
                })
                .expect(200)
        })

        it("GET /v1/user/bookMovie - failure", async () => {
            return request(app)
                .post("/user/bookMovie")
                .send({
                    userId:"",
                    theaterTimeMovieId:"11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
                    seats:["59a61c99-76b6-11ef-adac-8cec4bc9914d","59a62167-76b6-11ef-adac-8cec4bc9914d"]
                })
                .expect(400)
        })
    })

    describe("cancel booking", () => {
        it("GET /v1/user/cancelBooking - Success", async () => {
            return request(app)
                .post("/user/cancelBooking")
                .send({bookingId:"ce12e0d1-7d87-42e9-a932-3d0b4d0883b2"})
                .expect(200)
        })

        it("GET /v1/user/cancelBooking - failure - bad request", async () => {
            return request(app)
                .post("/user/cancelBooking")
                .send({bookingId:""})
                .expect(400)
        })

        it("GET /v1/user/cancelBooking - failure - not found", async () => {
            return request(app)
                .post("/user/cancelBooking")
                .send({bookingId:"ce12e0d1-7d87-42e9-a932"})
                .expect(404)
        })
    })

    describe("fetching showTimes", () => {
        it("GET /v1/user/getShowTimes - Success", async () => {
            return request(app)
                .get("/user/getShowTimes?theaterMovieId=55d6e131-53f4-421e-9fb8-53a19707f456")
                .expect(200)
        })

        it("GET /v1/user/getShowTimes - failure - bad request", async () => {
            return request(app)
            .get("/user/getShowTimes?theaterMovieId=")
                .expect(400)
        })

        it("GET /v1/user/getShowTimes - failure - not found", async () => {
            return request(app)
            .get("/user/getShowTimes?theaterMovieId=55d6e131-53f4-421e-9fb8")
                .expect(404)
        })


    })

    describe("fetching Theaters", () => {
        it("GET /v1/user/getTheaters - Success", async () => {
            return request(app)
                .get("/user/getTheaters?movieId=tt31322250")
                .expect(200)
        })

        it("GET /v1/user/getTheaters - failure - bad request", async () => {
            return request(app)
            .get("/user/getTheaters?movieId=")
                .expect(400)
        })

        it("GET /v1/user/getTheaters - failure - not found", async () => {
            return request(app)
            .get("/user/getTheaters?movieId=55d6e13")
                .expect(404)
        })


    })

    describe("fetching Bookings", () => {
        it("GET /v1/user/getBookings - success", () => {
            return request(app)
                .get("/user/getBookings?userId=0b37cef7-bedd-4b37-bfc4-21bd3eee7616")
                .expect(200)
        })

        it("GET /v1/user/getBookings - failure - userid empty", () => {
            return request(app)
                .get("/user/getBookings?userId=")
                .expect(400)
        })

        it("GET /v1/user/getBookings - failure - userid empty", () => {
            return request(app)
                .get("/user/getBookings?userId=hrstrtjt")
                .expect(404)
        })
    })

    describe("fetching Seats", () => {
        it("GET /v1/user/getSeats - success", () => {
            return request(app)
                .get("/user/getSeats?theaterMovieTimeId=11c3fb8e-c239-4e3d-804a-f6b38dcbb79f")
                .expect(200)
        })

        it("GET /v1/user/getSeats - failure - theaterMovieTimeId empty", () => {
            return request(app)
                .get("/user/getSeats?theaterMovieTimeId=")
                .expect(400)
        })

        it("GET /v1/user/getSeats - failure - theaterMovieTimeId not valid", () => {
            return request(app)
                .get("/user/getSeats?theaterMovieTimeId=hrstrtjt")
                .expect(404)
        })
    })

    describe("fetching Theater Time Movie Id", () => {
        it("GET /v1/user/getTheaterTimeMovieId - success", () => {
            return request(app)
                .get("/user/getTheaterTimeMovieId?theaterMovieId=33f03b7a-6190-4476-bf9d-f6ab782036cc&time=22:30:00")
                .expect(200)
        })

        it("GET /v1/user/getTheaterTimeMovieId - failure - theaterMovieId empty", () => {
            return request(app)
                .get("/user/getTheaterTimeMovieId?theaterMovieId=")
                .expect(400)
        })

        it("GET /v1/user/getTheaterTimeMovieId - failure - invalid theaterMovieId", () => {
            return request(app)
                .get("/user/getTheaterTimeMovieId?theaterMovieId=hrstrtjt")
                .expect(404)
        })
    })

    describe("fetching movies by genre", () => {
        it("GET /v1/user/getMoviesByGenre - success", () => {
            return request(app)
                .get("/user/getMoviesByGenre?genre=Short")
                .expect(200)
        })

        it("GET /v1/user/getMoviesByGenre - failure - theaterMovieId empty", () => {
            return request(app)
                .get("/user/getMoviesByGenre?genre=")
                .expect(400)
        })

        it("GET /v1/user/getMoviesByGenre - failure - invalid theaterMovieId", () => {
            return request(app)
                .get("/user/getMoviesByGenre?genre=hrstrtjt")
                .expect(404)
        })
    })
})

