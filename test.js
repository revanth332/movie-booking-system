import config from "./config.js"
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash("jk",await bcrypt.genSalt(5))
console.log(hash)
