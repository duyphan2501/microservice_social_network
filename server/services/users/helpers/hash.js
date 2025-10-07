import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);
const hashed = bcrypt.hashSync("1234", salt);
console.log(hashed);
