import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config({quiet: true})
const jwtSecretKey = process.env.JWT_SECRET_KEY

const signToken = (payload) => {
  return new Promise((resolve, reject) => {
    const options = { expiresIn: "20m" };
    jwt.sign(payload, jwtSecretKey, options, (err, token) => {
      if (err) return reject(err);
      return resolve(token);
    });
  });
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, jwtSecretKey, (err, payload) =>{
            if (err) return reject(err)
            return resolve(payload)
        })
    })
}


export {signToken, verifyToken}