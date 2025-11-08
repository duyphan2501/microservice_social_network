import CreateError from "http-errors";
import { generateAccessTokenAndSetCookie, generateRefreshTokenAndSetCookie } from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/password.helper.js";
import UserModel from "../models/UserModel.js";
import { filterFieldUser } from "../helpers/filterField.js";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      throw new CreateError.BadRequest("Vui lòng nhập username và password");

    const foundUser = await UserModel.getUserByUserName(username)
    if (!foundUser) throw new CreateError.NotFound("Người dùng không tồn tại");

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

    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserModel.setRefreshToken(foundUser.id, refreshToken, refreshTokenExpiresAt)

    return res.status(200).json({
      message: "Đăng nhập thành công",
      success: true,
      user: filterFieldUser(foundUser),
      accessToken
    });
  } catch (error) {
    next(error);
  }
};


export { login };
