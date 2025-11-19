import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import {
  createNewConversation,
  getConversationByUser,
  getConversationMessages,
  getConversations,
} from "../controllers/conversation.controller.js";
import { updateMessageStatus } from "../controllers/message.controller.js";

const conversationRouter = express.Router();

conversationRouter.get("/chat-user/:userId", checkAuth, getConversationByUser);
conversationRouter.post("/create", checkAuth, createNewConversation);
conversationRouter.put("/status/update", checkAuth, updateMessageStatus);
conversationRouter.get("/user/:userId", getConversations);
conversationRouter.get(
  "/:conversationId/messages",
  checkAuth,
  getConversationMessages
);


export default conversationRouter;
