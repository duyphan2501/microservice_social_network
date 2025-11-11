import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import {
  getConversationMessages,
  getConversations,
} from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.get("/:userId", getConversations);
conversationRouter.get(
  "/:conversationId/messages",
  checkAuth,
  getConversationMessages
);

export default conversationRouter;
