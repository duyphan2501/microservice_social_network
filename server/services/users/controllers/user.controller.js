import {
  generateAccessTokenAndSetCookie,
  generateRefreshTokenAndSetCookie,
  verifyRefreshToken,
} from "../helpers/jwt.helper.js";
import { comparePassword, hashPassword } from "../helpers/password.helper.js";
import UserModel from "../models/UserModel.js";
import { filterFieldUser } from "../helpers/filterField.js";
import createHttpError from "http-errors";
import { uploadFileToCloudinary } from "../helpers/cloudinary.helper.js";

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) throw createHttpError.BadRequest("Please provide email");

    const foundUser = await UserModel.getUserByEmail(email);

    if (!foundUser) throw createHttpError.NotFound("User not found");

    await UserModel.sendForgotPasswordEmailtoUser(foundUser);

    return res.status(200).json({
      message: "Successfully sent password reset email",
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
      throw new createHttpError.BadRequest(
        "Please provide account and password"
      );
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(account);

    const foundUser = !isEmail
      ? await UserModel.getUserByUserName(account)
      : await UserModel.getUserByEmail(account);

    if (!foundUser) throw new createHttpError.NotFound("User does not exist");

    const isCorrectPassword = await comparePassword(
      password,
      foundUser.password_hash
    );

    // const isCorrectPassword = password === foundUser.password_hash;

    if (!isCorrectPassword)
      throw new createHttpError.Unauthorized("Password is incorrect");

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
      message: "Login successfully",
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
    const userId = req.user?.userId;
    // clear cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    // update db
    if (userId) {
      await UserModel.setRefreshToken(userId, null, null);
    }

    return res.status(200).json({
      message: "Logout successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId)
      throw createHttpError.BadRequest("UserId parameter is required");

    const foundUser = await UserModel.getUserById(userId);

    if (!foundUser) throw createHttpError.NotFound("User not found");

    return res.status(200).json({
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

    if (!email) throw createHttpError.BadRequest("Email is required");

    const isExistingUser = await UserModel.getUserByEmail(email);
    if (isExistingUser) {
      throw createHttpError.Conflict("Email is already in use");
    }

    if (!fullname) throw createHttpError.BadRequest("Full name is required");

    if (!username) throw createHttpError.BadRequest("Username is required");

    const isExistingUsername = await UserModel.getUserByUserName(username);
    if (isExistingUsername) {
      throw createHttpError.Conflict("Username is already taken");
    }

    if (!password) throw createHttpError.BadRequest("Password is required");

    if (!validatePassword(password)) {
      throw createHttpError.BadRequest(
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters"
      );
    }

    if (password !== confirmPassword) {
      throw createHttpError.BadRequest("Password confirmation does not match");
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
      message: "Account created successfully",
      user: filterFieldUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) throw createHttpError.BadRequest("Invalid token");

    if (!password)
      throw createHttpError.BadRequest("Please enter a new password");

    if (!confirmPassword)
      throw createHttpError.BadRequest("Please confirm your new password");

    const foundUser = await UserModel.getUserByForgotpasswordToken(token);

    if (!foundUser) throw createHttpError.NotFound("User not found");

    // Token expired
    if (foundUser.forgot_password_token_expires_at < new Date()) {
      await UserModel.sendForgotPasswordEmailtoUser(foundUser);
      throw createHttpError.BadRequest(
        "The reset token has expired. A new password reset email has been sent. Please check your inbox."
      );
    }

    if (password !== confirmPassword) {
      throw createHttpError.BadRequest("Password confirmation does not match");
    }

    const hashedPassword = await hashPassword(password);

    await UserModel.updateUserPassword(foundUser.id, hashedPassword);

    await UserModel.updateTokenAsUsed(token);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const { userId, fullname, username, bio, base_avatar_url, removeAvatar } =
      req.body;
    const file = req.file;

    if (!userId) throw createHttpError.BadRequest("Missing userId");
    if (!fullname) throw createHttpError.BadRequest("Missing fullname");
    if (!username) throw createHttpError.BadRequest("Missing username");
    // if (!bio) throw createHttpError.BadRequest("Missing bio");

    const user = await UserModel.getUserByUserName(username);

    if (user && user?.id != userId) {
      throw createHttpError.BadRequest("This username already be used!");
    }

    let avatar_url = base_avatar_url;

    if (file) {
      const { url, public_id } = await uploadFileToCloudinary(
        file.path,
        "avatars"
      );
      avatar_url = url;
    }

    if (removeAvatar === "true") {
      avatar_url = null;
    }

    const result = await UserModel.updateUserInfo(
      userId,
      fullname,
      username,
      bio,
      avatar_url
    );

    const userNew = await UserModel.getUserById(userId);

    return res.status(200).json({
      success: true,
      message: "Update user successfully",
      user: filterFieldUser(userNew),
    });
  } catch (error) {
    next(error);
  }
};

const changeUserPassword = async (req, res, next) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const user = await UserModel.getUserById(userId);
    if (!user) throw createHttpError.NotFound("User not found");

    if (!oldPassword)
      throw createHttpError.NotFound("Fill in the old password");

    if (!newPassword)
      throw createHttpError.NotFound("Fill in the new password");

    if (!confirmPassword)
      throw createHttpError.NotFound("Fill in the new password confirmation");

    const validOldPassword = await comparePassword(
      oldPassword,
      user.password_hash
    );

    if (!validOldPassword)
      throw createHttpError.BadRequest("The current password is incorrect");

    const validNewPassword = passwordRegex.test(newPassword);

    if (!validNewPassword)
      throw createHttpError.BadRequest(
        "New password must be at least 8 characters, include uppercase, lowercase, number and special character"
      );

    if (newPassword !== confirmPassword) {
      throw createHttpError.BadRequest("Password confirmation does not match");
    }

    const hashedPassword = await hashPassword(newPassword);

    await UserModel.updateUserPassword(userId, hashedPassword);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const refreshUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await UserModel.getUserById(userId);

    if (!user) throw createHttpError.NotFound("User not found");

    const accessToken = req.cookies.accessToken;

    return res.status(200).json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { term } = req.query;

    if (!term || term === "") return res.status(200).json({ users: [] });

    const users = await UserModel.searchUsers(term);

    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username)
      throw createHttpError.BadRequest("Username parameter is required");
    const user = await UserModel.getUserByUserName(username);
    if (!user) throw createHttpError.NotFound("User not found");
    return res.status(200).json({ user });
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
  updateUserInfo,
  changeUserPassword,
  refreshUser,
  searchUsers,
  getUserByUsername,
};
