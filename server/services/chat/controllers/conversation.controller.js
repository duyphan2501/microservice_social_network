import createHttpError from "http-errors";
import ConversationModel from "../models/conversation.model.js";

const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) throw createHttpError.BadRequest("Thiếu mã người dùng");

    const conversations =
      (await ConversationModel.getConversationsByUserId(userId)) || [];

    return res.status(200).json({
      message: "Lấy đoạn chat thành công",
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

export { getConversations };
