import express from 'express';
import request from 'supertest';
import publihserRouter from '../../src/app/v1/routes/publisher.router.js'
import { closeConnection } from "../../src/app/v1/utils/dbConnection.js";


const app = express();

app.use(express.json());

app.use("/publisher",publihserRouter)

afterAll(async () => {
    await closeConnection();
})

describe("publisher controller integration test", () => {
    describe("adding movies",() => {
        it("POST /v1/publisher/addMovie - Success",async () => {
            return request(app)
                .post("/publisher/addMovie")
                .send({ imdbID : "tt33092162", theaterId : "2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b", price : "130", date : "2024-10-12", time:["10:00"] })
                .expect(200)
        })

        it("POST /v1/publisher/addMovie - failure - empty fields",async () => {
            return request(app)
                .post("/publisher/addMovie")
                .send({ imdbID : "", theaterId : "2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b", price : "130", date : "2024-10-12", time:["10:00"] })
                .expect(400)
        })

        it("POST /v1/publisher/addMovie - failure - invalid fields",async () => {
            return request(app)
                .post("/publisher/addMovie")
                .send({ imdbID : "tt33092", theaterId : "2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b", price : "130", date : "2024-10-12", time:["10:00"] })
                .expect(500)
        })
    })


    describe("fetching published movies",() => {
        it("POST /v1/publisher/getPublishedMovies - Success",async () => {
            return request(app)
                .get("/publisher/getPublishedMovies?theaterId=2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b")
                .expect(200)
        })

        it("POST /v1/publisher/getPublishedMovies - failure - empty theaterId",async () => {
            return request(app)
                .get("/publisher/getPublishedMovies?theaterId=")
                .expect(400)
        })

        it("POST /v1/publisher/getPublishedMovies - failure - invalid theaterId",async () => {
            return request(app)
                .get("/publisher/getPublishedMovies?theaterId=wrongid")
                .expect(404)
        })
    })

    describe("canceling published movies",() => {
        it("POST /v1/publisher/cancelPublishedMovie - Success",async () => {
            return request(app)
                .delete("/publisher/cancelPublishedMovie?theaterMovieTimeId=15bbc149-9744-4021-8a4b-392f56d87d8c&date=2024-09-25&theaterMovieId=55d6e131-53f4-421e-9fb8-53a19707f456&movieId=2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b")
                .expect(200)
        })

        it("POST /v1/publisher/cancelPublishedMovie - failure - empty theaterId",async () => {
            return request(app)
                .delete("/publisher/cancelPublishedMovie?theaterMovieTimeId=&date=2024-09-25&theaterMovieId=55d6e131-53f4-421e-9fb8-53a19707f456&movieId=2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b")
                .expect(400)
        })
    })

})