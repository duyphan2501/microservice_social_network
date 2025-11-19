import jwt from "jsonwebtoken";
import ENV from "./env.helper.js";

const generateAccessTokenAndSetCookie = async (res, userId) => {
  const token = await new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      ENV.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  return token;
};

const generateRefreshTokenAndSetCookie = async (res, userId) => {
  const token = await new Promise((resolve, reject) => {
    jwt.sign(
      { userId },
      ENV.REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: "14d" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET_KEY, (err, payload) => {
      if (err) return reject(err);
      return resolve(payload);
    });
  });
};

const verifyAccessToken = async (accessToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY,
      (err, payload) => {
        if (err) return reject(err);
        return resolve(payload);
      }
    );
  });
};

export {
  generateAccessTokenAndSetCookie,
  generateRefreshTokenAndSetCookie,
  verifyRefreshToken,
  verifyAccessToken,
};
