import Publisher from "../../src/app/v1/models/publisher.model.js";
import { StatusCodes } from "http-status-codes";
import {
  closeConnection,
  poolPromise,
} from "../../src/app/v1/utils/dbConnection.js";
import axios from 'axios';
import * as uuid from "uuid";

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

describe("adding Movie in theater",() => {
    it("should add movie successfully", async () => {
        let mockMovie = {
            imdbID: "tt123456",
            theaterId: "theater123",
            price: "140",
            date: "2024-09-09",
            time: ["10:00", "09:00"],
          };

        let mockFetchedMovie = {
            Title: "The Lost City of Atlantis",
            Rated: "PG-13",
            Released: "2025-06-12",
            Runtime: "120 min",
            Genre: "Adventure, Sci-Fi",
            Director: "Steven Spielberg",
            Plot: "A daring archaeologist embarks on a perilous quest to discover the mythical lost city of Atlantis, facing ancient curses and rival treasure hunters along the way.",
            Poster: "https://example.com/atlantis_poster.jpg",
            Actors: "Tom Hanks, Margot Robbie, Chris Pratt",
            Language: "English"
        }

        jest.spyOn(axios,"get").mockResolvedValueOnce({data : mockFetchedMovie});
        jest.spyOn(uuid,"v4").mockReturnValueOnce("theatermovieid");
        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[]]).mockResolvedValueOnce([{affectedRows : 1}]).mockResolvedValueOnce([[]]).mockResolvedValueOnce().mockResolvedValueOnce();

        const result = await Publisher.addMovie(mockMovie);

        expect(result).toEqual({ status: StatusCodes.OK, msg: "Successfully added movie" });
    })
})

// describe("fetching published movies", () => {
//     it("should fetch published movies", async () => {
//         let mockMovie = {
//             theater_movie_time_id: "11c3fb8e-c239-4e3d-804a-f6b38dcbb79f",
//             movie_name: "The Spider of Spiderweb Canyon",
//             description:
//               "A woman making a video in a forest encounters a strange stranger.",
//             price: "140",
//             date: "2024-09-09",
//             time: "10:00",
//             theater_movie_id: "33f03b7a-6190-4476-bf9d-f6ab782036cc",
//             movie_id: "tt31322250",
//           };

//           jest.spyOn(mockPool,"query").mockResolvedValueOnce([[mockMovie]]);

//           const result = await Publisher.getPublishedMovies();

//           expect(result).toEqual({ status: StatusCodes.OK, data: [mockMovie] });
//     })
// })

describe("cancel movie",() => {
    it("should cancel movie",async () => {
        let mockMovieData = {
            theaterMovieTimeId:"theatermovietimeid",
            date:"2024-09-09",
            theaterMovieId:"theatermovieid",
            movieId : "movieid"
        }

        jest.spyOn(mockPool,"query").mockResolvedValueOnce([[{email:"email",booking_id:"bookingid"}]])
                                    .mockResolvedValueOnce([[{theater_name:"theatername",movie_name:"moviename",date:"2024-09-09",time:"10:00"}]])
                                    .mockResolvedValueOnce()
                                    .mockResolvedValueOnce([[{count:1}]])
        const result = await Publisher.cancelPublishedMovie(mockMovieData);

        expect(result).toEqual({ status: StatusCodes.OK, msg: "Show deleted successfully" })

    })
})