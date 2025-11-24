import createHttpError from "http-errors";
import ConversationModel from "../models/conversation.model.js";

const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {status} = req.query || "active";
    if (!userId) throw createHttpError.BadRequest("Thiếu mã người dùng");

    const conversations =
      (await ConversationModel.getConversationsByUserId(userId, status))

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

const createNewConversation = async (req, res, next) => {
  try {
    const { partnerId } = req.body;
    if (!partnerId) throw createHttpError.BadRequest("Partner id is required");
    const creatorId = req.user.userId;
    const isExist = await ConversationModel.getConversation(
      creatorId,
      partnerId
    );
    if (isExist) throw createHttpError.BadRequest("Conversation is existing");
    const insertId = await ConversationModel.createConversation(
      creatorId,
      partnerId
    );
    return res.status(201).json({
      insertId,
    });
  } catch (error) {
    next(error);
  }
};

const getConversationByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw createHttpError.BadRequest("Chat user id is required");
    const currentUserId = req.user.userId;

    const conversation = await ConversationModel.getConversation(
      userId,
      currentUserId
    );

    return res.status(200).json({
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getConversations,
  getConversationMessages,
  createNewConversation,
  getConversationByUser,
};
