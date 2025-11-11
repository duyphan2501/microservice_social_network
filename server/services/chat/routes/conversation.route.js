import express from "express"
import checkAuth from "../middlewares/checkAuth.js"
import { getConversations } from "../controllers/conversation.controller.js"

const conversationRouter = express.Router()

conversationRouter.get("/:userId", checkAuth, getConversations)

export default conversationRouter