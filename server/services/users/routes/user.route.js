import express from "express";
import {
  forgotPassword,
  getUserInfo,
  login,
  logout,
  refreshToken,
  signUp,
  resetPassword,
  updateUserInfo,
  changeUserPassword,
  refreshUser,
  searchUsers,
} from "../controllers/user.controller.js";
import { uploadImg } from "../middlewares/cloudinary.middleware.js";
import { checkAuth, optionAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.put(
  "/update-info",
  checkAuth,
  uploadImg.single("avatarFile"),
  updateUserInfo
);
router.post("/sign-up", signUp);
router.get("/refresh-user", checkAuth, refreshUser);
router.put("/refresh-token", refreshToken);
router.put("/change-password", checkAuth, changeUserPassword);
router.delete("/logout", optionAuth, logout);
router.get("/get-info/:userId", getUserInfo);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/search", searchUsers);

export default router;
