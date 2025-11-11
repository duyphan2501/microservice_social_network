import {
  generateAccessTokenAndSetCookie,
  generateRefreshTokenAndSetCookie,
  verifyRefreshToken,
} from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/password.helper.js";
import UserModel from "../models/UserModel.js";
import { filterFieldUser } from "../helpers/filterField.js";
import createHttpError from "http-errors";

const login = async (req, res, next) => {
  try {
    const { account, password } = req.body;

    if (!account || !password)
      throw new createHttpError.BadRequest("Vui lòng nhập đủ thông tin");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(account);

    const foundUser = !isEmail
      ? await UserModel.getUserByUserName(account)
      : await UserModel.getUserByEmail(account);

    if (!foundUser)
      throw new createHttpError.NotFound("Người dùng không tồn tại");

    if (!foundUser.is_verified) {
      return res.status(401).json({
        message:
          "Tài khoản chưa được xác minh! Vui lòng kiểm tra email để xác minh tài khoản.",
        user: filterFieldUser(foundUser),
        success: false,
        notVerified: true,
      });
    }

    // const isCorrectPassword = await comparePassword(password, foundUser.password_hash);

    const isCorrectPassword = password === foundUser.password_hash;

    if (!isCorrectPassword) throw new createHttpError("Mật khẩu không đúng");

    // generate token and set cookie
    const accessToken = await generateAccessTokenAndSetCookie(
      res,
      foundUser.id
    );
    const refreshToken = await generateRefreshTokenAndSetCookie(
      res,
      foundUser.id
    );

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await UserModel.setRefreshToken(
      foundUser.id,
      refreshToken,
      refreshTokenExpiresAt
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      success: true,
      user: filterFieldUser(foundUser),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw createHttpError.BadRequest("Refresh token is missing");

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    const userId = payload.userId;
    // Kiểm tra token còn hạn trong DB
    const user = await UserModel.checkRefreshToken(userId, refreshToken);

    if (!user)
      throw createHttpError.Unauthorized("Invalid or expired refresh token");

    // generate new token
    const accessToken = await generateAccessTokenAndSetCookie(res, user.id);
    const newRefreshToken = await generateRefreshTokenAndSetCookie(
      res,
      user.id
    );

    // save token in db
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await UserModel.setRefreshToken(
      user.id,
      newRefreshToken,
      refreshTokenExpiresAt
    );

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
      user: filterFieldUser(user),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    // clear cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    // update db
    await UserModel.setRefreshToken(userId, null, null);

    return res.status(200).json({
      message: "Đăng xuất thành công",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) throw createHttpError.BadRequest("Thiếu mã người dùng");

    const foundUser = await UserModel.getUserById(userId);

    if (!foundUser) throw createHttpError.NotFound("Người dùng không tồn tại");

    return res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user: filterFieldUser(foundUser),
    });
  } catch (error) {
    next(error);
  }
};

export { login, refreshToken, logout, getUserInfo };
