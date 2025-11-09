import express from "express"
import { login, refreshToken } from "../controllers/user.controller.js"

const router = express.Router()

router.post("/login", login)
router.put("/refresh-token", refreshToken)

export default router