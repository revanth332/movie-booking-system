
import dotenv from 'dotenv';

const args = process.argv && process.argv.slice(2);
const env = args && args.length > 0 ? args[0] : 'development';

let config; 

try {
    dotenv.config();

    config = {
        ENV:env,
        DATABASE_HOST: process.env.DATABASE_HOST,
        DATABASE_USER: process.env.DATABASE_USER,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
        DATABASE_NAME: process.env.DATABASE_NAME,
        DATABASE_PORT:process.env.DATABASE_PORT,
        MOVIE:process.env.MOVIE,
        THEATER:process.env.THEATER,
        SEAT:process.env.SEAT,
        BOOKING:process.env.BOOKING,
        USER:process.env.USER,
        SECRET_KEY:process.env.SECRET_KEY
    };
} catch (error) {
    console.log(error);
}

export default config; 
