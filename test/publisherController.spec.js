import { StatusCodes } from "http-status-codes";
import { closeConnection } from "../src/app/v1/utils/dbConnection.js";
import Publisher from "../src/app/v1/models/publisher.model.js";
import { addMovie, cancelPublishedMovie, getPublishedMovies, loginPublisher, registerTheater } from "../src/app/v1/controllers/publisher.controller.js";

afterAll(async () => {
    await closeConnection();
})
  
describe("Publisher controller",() => {

    describe("adding Movie",() => {
        let mockReq,mockRes,mockMovie;
        mockMovie = {
            imdbID:"tt123456",
            theaterId:"theater123",
            price:"140",
            date:"2024-09-09",
            time:["10:00","09:00"]
        };
        beforeEach(() => {
          mockReq = { body: mockMovie },
          mockRes = {status : jest.fn().mockReturnThis(),send:jest.fn()}
        })

        it("should add movie successfully", async () => {
            jest.spyOn(Publisher,"addMovie").mockResolvedValueOnce({ status: StatusCodes.OK, msg: "Successfully added movie" });

            await addMovie(mockReq,mockRes);

            expect(Publisher.addMovie).toHaveBeenCalledWith(mockMovie);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith("Successfully added movie")
        })

        it("should throw error while adding movie", async () => {
            jest.spyOn(Publisher,"addMovie").mockRejectedValueOnce(new Error("An error occured"));

            await addMovie(mockReq,mockRes);

            expect(Publisher.addMovie).toHaveBeenCalledWith(mockMovie);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith("An error occured")
        })
    })

    describe("helper date and time formatting fucntions", () => {
        it("should convert 24 hour format intp 12 hour format", () => {
            const converted = Publisher.convertTo12HourFormat("18:00");
            expect(converted).toBe("6:00 PM")
        })

        it("should format dd mm year into  yyyy-mm-dd format", () => {

            const converted = Publisher.formatDate("12 Jan 2024");
            expect(converted).toBe("2024-1-12")
        })

        it("should convert minutes intp hh:mm format", () => {
            const converted = Publisher.formatTime("120 mm");
            expect(converted).toBe("02:00")
        })

        it("should find weather a character is alphabetic or not", () => {
            const converted = Publisher.isAlphabetic("s");
            expect(converted).toBe(true)
        })
    })

    describe("fetching Published Movies",() => {
        let mockReq,mockRes,mockMovie;
        mockMovie = {
            theater_movie_time_id : "11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
            movie_name : "The Spider of Spiderweb Canyon",
            description : "A woman making a video in a forest encounters a strange stranger.",
            price : "140",
            date : "2024-09-09",
            time:"10:00",
            theater_movie_id:"33f03b7a-6190-4476-bf9d-f6ab782036cc",
            movie_id:"tt31322250"
        }
        beforeEach(() => {
            mockReq = {query:{theaterId:"theater123"}};
            mockRes = {status : jest.fn().mockReturnThis(),send:jest.fn()}
        })

        it("should fetch published movies successfully",async () => {
            jest.spyOn(Publisher,"getPublishedMovies").mockResolvedValueOnce({ status: StatusCodes.OK, data : [mockMovie] });

            await getPublishedMovies(mockReq,mockRes);
            
            expect(Publisher.getPublishedMovies).toHaveBeenCalledWith("theater123")
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith([mockMovie])
        })

        it("should throw error while fetching published movies",async () => {
            jest.spyOn(Publisher,"getPublishedMovies").mockRejectedValueOnce(new Error("An error occured"));

            await getPublishedMovies(mockReq,mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith("Failed to fetch movies");
        })
    })

    describe("cancellinng published movie",() => {
        let mockReq,mockRes;
        beforeEach(() => {
            mockReq = {query:{theaterMovieTimeId:"11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",theaterMovieId:"33f03b7a-6190-4476-bf9d-f6ab782036cc",movieId:"tt31322250",date:"2024-09-09"}};
            mockRes = {status : jest.fn().mockReturnThis(),send:jest.fn()}
        })

        it("should cancel published movie successfully",async () => {
            jest.spyOn(Publisher,"cancelPublishedMovie").mockResolvedValueOnce({ status: StatusCodes.OK, msg: "Show deleted successfully" });

            await cancelPublishedMovie(mockReq,mockRes);

            expect(Publisher.cancelPublishedMovie).toHaveBeenCalledWith("11c3fb8e-c239-4e3d-804a-f6b38dcbb79f","2024-09-09","33f03b7a-6190-4476-bf9d-f6ab782036cc","tt31322250");
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith("Show deleted successfully");
        })

        it("should throw error while cancelling published movie",async () => {
            jest.spyOn(Publisher,"cancelPublishedMovie").mockRejectedValueOnce(new Error("An error occured"));

            await cancelPublishedMovie(mockReq,mockRes);

            expect(Publisher.cancelPublishedMovie).toHaveBeenCalledWith("11c3fb8e-c239-4e3d-804a-f6b38dcbb79f","2024-09-09","33f03b7a-6190-4476-bf9d-f6ab782036cc","tt31322250");
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith("Failed to fetch movies");
        })

    })
  })  