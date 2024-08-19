import config from "./config.js"
import bcrypt from 'bcryptjs';
import {v4 as uuid} from 'uuid';

const hash = await bcrypt.hash("jk",await bcrypt.genSalt(5))
console.log(uuid())
