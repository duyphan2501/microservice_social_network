import express from "express";
import {
  getUserInfo,
  login,
  logout,
  refreshToken,
  signUp,
} from "../controllers/user.controller.js";
import checkAuth from "../../chat/middlewares/checkAuth.js";

const router = express.Router();

router.post("/login", login);
router.post("/sign-up", signUp);
router.put("/refresh-token", refreshToken);
router.delete("/logout", checkAuth, logout);
router.get("/get-info/:userId", getUserInfo);

export default router;
