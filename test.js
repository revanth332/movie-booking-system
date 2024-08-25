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
const cmp = await bcrypt.compare(
  "hashedpassword1",
  "$2a$05$J1hBGkYFEsbA27/eqwlIiuUYsgqOQRQUhBcVqrHOP.VKAg3BL5PYG"
);
console.log(cmp);
