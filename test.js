// import config from "./config.js"
import bcrypt from "bcryptjs";
// import {v4 as uuid} from 'uuid';

const pswds = [
  "hashedpassword1",
  "hashedpassword2",
  "hashedpassword3",
  "hashedpassword4",
  "hashedpassword5",
];
// for (let pswd of pswds) {
//   const hash = await bcrypt.hash(pswd,await bcrypt.genSalt(5));
//   console.log(hash)
// }

// const hash = await bcrypt.hash("jk",await bcrypt.genSalt(5))
// console.log(hash)

// function fun(){
//     throw {name:"revanth"}
// }

// try{
//     fun()
// }

// catch(err){
//     console.log(err.name)
// }
// const cmp = await bcrypt.compare(
//   "hashedpassword1",
//   "$2a$05$J1hBGkYFEsbA27/eqwlIiuUYsgqOQRQUhBcVqrHOP.VKAg3BL5PYG"
// );
// console.log(cmp);

import axios from 'axios'


// const options = {
//   method: 'GET',
//   url: 'https://api.themoviedb.org/3/movie/changes?page=1',
//   headers: {
//     accept: 'application/json',
//     Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlYWQ2MTRjYmMwZjg0NDNjMzljZTNkNmFkOTdjODY2NiIsIm5iZiI6MTcyNDkyODk2NS45NDQ4ODUsInN1YiI6IjY2ZDA1MWJhMDBiMDllMjc3YWQzMzQzZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wp8cFDi1ADSmOvPcQMfv9r6jcQqgdBQJwSeXJ0CAQJ0'
//   }
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });


// const options = {
//   method: 'GET',
//   url: 'http://www.omdbapi.com/?s=hello&y=2024&type=movie&page=1&apikey=658d4be7',
// };

// try {
// 	const response = await axios.request(options);
// 	console.log(response.data);
// } catch (error) {
// 	console.error(error);
// }

const name = undefined;
console.log(typeof name)