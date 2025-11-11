import createHttpError from "http-errors";
import ConversationModel from "../models/conversation.model.js";

const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw createHttpError.BadRequest("Thiếu mã người dùng");

    const conversations =
      (await ConversationModel.getConversationsByUserId(userId)) || [];

    return res.status(200).json({
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const beforeId = req.query.beforeId;
    const userId = req.user.userId;

    if (!conversationId) throw createHttpError.BadRequest("Thiếu mã đoạn chat");

    const messages = await ConversationModel.getConversationMessagesBy(
      conversationId,
      limit,
      beforeId,
      userId
    );

    return res.status(200).json({
      messages: messages || [],
    });
  } catch (error) {
    next(error);
  }
};

export { getConversations, getConversationMessages };
