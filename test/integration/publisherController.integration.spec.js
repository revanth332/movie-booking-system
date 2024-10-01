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
        it.only("POST /v1/publisher/addMovie - Success",async () => {
            return request(app)
                .post("/publisher/addMovie")
                .send({ imdbID : "tt33092162", theaterId : "2c8b4a76-d94d-4e2f-88ee-2c9b5e9b7f7b", price : "130", date : "2024-10-12", time:["10:00"] })
                .expect(200)
        })
    })
})