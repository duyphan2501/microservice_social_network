import express from "express"
import { getUserInfo, login, logout, refreshToken } from "../controllers/user.controller.js"
import checkAuth from "../../chat/middlewares/checkAuth.js"

const router = express.Router()

router.post("/login", login)
router.put("/refresh-token", refreshToken)
router.delete("/logout", checkAuth, logout)
router.get("/get-info/:userId", getUserInfo)

export default router