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

const options = {
  method: 'GET',
  url: 'https://streaming-availability.p.rapidapi.com/shows/%7Btype%7D/%7Bid%7D',
  headers: {
    'x-rapidapi-key': '6ce8e94de9mshdb168d323d19a23p165866jsn4c8d2bbb0d9f',
    'x-rapidapi-host': 'streaming-availability.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
