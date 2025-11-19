import createHttpError from "http-errors";
import uploadFiles from "../helpers/upload.js";
import { sendQueue } from "../messages/rabbitMQ.js";
import MessageModel from "../models/message.model.js";

const MESSAGE_IMAGES_FOLDER = "message_images";

const uploadMessageImages = async (req, res, next) => {
  try {
    const images = req.files;

    if (!images || !images.length === 0)
      throw createHttpError.BadRequest("Không có file ảnh nào được cung cấp.");

    const options = {
      folder: MESSAGE_IMAGES_FOLDER,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    const uploadedResults = await uploadFiles(images, options);

    const uploadedImages = uploadedResults.map((item) => ({
      ...item,
      type: "image",
    }));

    res.status(200).json({
      message: "Upload thành công",
      uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    // messageData: { conversationId, senderId, content, type, media, tempId }
    const messageData = req.body;
    const { messageId, receiverId } = await MessageModel.saveNewMessage(messageData);
    const savedMessage = await MessageModel.getMessageById(messageId);

    const eventPayload = {
      type: "NEW_MESSAGE_SAVED",
      data: {
        ...savedMessage,
        tempId: messageData.tempId,
        receiverId
      },
    };
    await sendQueue("chat_events_to_client", JSON.stringify(eventPayload));

    res.status(201).json({ savedMessage });
  } catch (error) {
    next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const { conversationId, messageId, userId, status } = req.body;
    await MessageModel.markMessageStatus(messageId, userId, status);

    const eventPayload = {
      type: "MESSAGE_STATUS_UPDATED",
      data: { conversationId, messageId, status },
    };

    await sendQueue("chat_events_to_client", JSON.stringify(eventPayload));

    return res.status(200).json({ message: "Cập nhật status thành công" });
  } catch (error) {
    next(error);
  }
};

export { uploadMessageImages, sendMessage, updateMessageStatus };
