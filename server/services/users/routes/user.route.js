import express from "express";
import {
  forgotPassword,
  getUserInfo,
  login,
  logout,
  refreshToken,
  signUp,
  resetPassword,
} from "../controllers/user.controller.js";
import checkAuth from "../../chat/middlewares/checkAuth.js";

const router = express.Router();

router.post("/login", login);
router.post("/sign-up", signUp);
router.put("/refresh-token", refreshToken);
router.delete("/logout", checkAuth, logout);
router.get("/get-info/:userId", getUserInfo);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

export default router;
