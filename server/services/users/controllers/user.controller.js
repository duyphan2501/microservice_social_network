import CreateError from "http-errors";
import {
  generateAccessTokenAndSetCookie,
  generateRefreshTokenAndSetCookie,
  verifyRefreshToken,
} from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/password.helper.js";
import UserModel from "../models/UserModel.js";
import { filterFieldUser } from "../helpers/filterField.js";

const login = async (req, res, next) => {
  try {
    const { account, password } = req.body;

    if (!account || !password)
      throw new CreateError.BadRequest("Vui lòng nhập đủ thông tin");

    const isEmail = account.includes("@");

    const foundUser = !isEmail
      ? await UserModel.getUserByUserName(account)
      : await UserModel.getUserByEmail(account);

    if (!foundUser) throw new CreateError.NotFound("Người dùng không tồn tại");

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

    if (!isCorrectPassword) throw new CreateError("Mật khẩu không đúng");

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
    if (!refreshToken) throw CreateError.BadRequest("Refresh token is missing");

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    const userId = payload.userId;
    // Kiểm tra token còn hạn trong DB
    const user = await UserModel.checkRefreshToken(userId, refreshToken);

    if (!user)
      throw CreateError.Unauthorized("Invalid or expired refresh token");

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

export { login, refreshToken };
