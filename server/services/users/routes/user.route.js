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
} from "../controllers/user.controller.js";
import checkAuth from "../../chat/middlewares/checkAuth.js";
import { uploadImg } from "../middlewares/cloudinary.middleware.js";

const router = express.Router();

router.post("/login", login);
router.put(
  "/update-info",
  checkAuth,
  uploadImg.single("avatarFile"),
  updateUserInfo
);
router.post("/sign-up", signUp);
router.put("/refresh-token", refreshToken);
router.put("/change-password", checkAuth, changeUserPassword);
router.delete("/logout", checkAuth, logout);
router.get("/get-info/:userId", getUserInfo);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

export default router;
