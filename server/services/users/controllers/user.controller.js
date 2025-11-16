import {
  generateAccessTokenAndSetCookie,
  generateRefreshTokenAndSetCookie,
  verifyRefreshToken,
} from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/password.helper.js";
import UserModel from "../models/UserModel.js";
import { filterFieldUser } from "../helpers/filterField.js";
import createHttpError from "http-errors";

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw createHttpError.BadRequest("Vui lòng nhập email");

    const foundUser = await UserModel.getUserByEmail(email);

    if (!foundUser) throw createHttpError.NotFound("Người dùng không tồn tại");

    await UserModel.sendForgotPasswordEmailtoUser(foundUser);

    return res.status(200).json({
      message: "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

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

    // const isCorrectPassword = await comparePassword(
    //   password,
    //   foundUser.password_hash
    // );

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

const signUp = async (req, res, next) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  function validatePassword(password) {
    return passwordRegex.test(password);
  }

  try {
    const { username, email, fullname, password, confirmPassword } = req.body;

    if (!email) throw createHttpError.BadRequest("Vui lòng nhập email!");

    const isExistingUser = await UserModel.getUserByEmail(email);

    if (isExistingUser) {
      throw createHttpError.Conflict("Email đã được sử dụng!");
    }

    if (!fullname) throw createHttpError.BadRequest("Vui lòng nhập họ tên!");

    if (!username)
      throw createHttpError.BadRequest("Vui lòng nhập tên đăng nhập!");

    const isExistingUsername = await UserModel.getUserByUserName(username);
    if (isExistingUsername) {
      throw createHttpError.Conflict("Tên đăng nhập đã được sử dụng!");
    }

    if (!password) throw createHttpError.BadRequest("Vui lòng nhập mật khẩu!");

    if (!validatePassword(password)) {
      throw createHttpError.BadRequest(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
    }

    if (password !== confirmPassword) {
      throw createHttpError.BadRequest("Mật khẩu không khớp!");
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.addUser({
      username,
      email,
      fullname,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công!",
      user: filterFieldUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) throw createHttpError.BadRequest("Token không hợp lệ");

    if (!password)
      throw createHttpError.BadRequest("Vui lòng nhập mật khẩu mới!");

    if (!confirmPassword)
      throw createHttpError.BadRequest("Vui lòng nhập lại mật khẩu mới!");

    const foundUser = await UserModel.getUserByForgotpasswordToken(token);

    if (!foundUser) throw createHttpError.NotFound("Tài khoản không tồn tại");

    if (foundUser.forgot_password_token_expires_at < new Date()) {
      await UserModel.sendForgotPasswordEmailtoUser(foundUser);
      throw createHttpError.BadRequest(
        "Token đã hết hạn. Chúng tôi đã gửi lại email đặt lại mật khẩu mới cho bạn. Vui lòng kiểm tra hộp thư đến."
      );
    }

    if (password !== confirmPassword) {
      throw createHttpError.BadRequest("Mật khẩu không khớp!");
    }

    const hashedPassword = await hashPassword(password);

    await UserModel.updateUserPassword(foundUser.id, hashedPassword);

    await UserModel.updateTokenAsUsed(token);

    return res.status(200).json({
      message: "Đặt lại mật khẩu thành công!",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export {
  login,
  refreshToken,
  logout,
  getUserInfo,
  signUp,
  forgotPassword,
  resetPassword,
};
