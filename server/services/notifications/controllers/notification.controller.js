import { publishDirect } from "../messages/rabbitMQ.js";
import NotificationModel from "../models/notification.model.js";

const getAllNotification = async (req, res, next) => {
  try {
    const recipientId = Number(req.params.recipientId);
    if (!recipientId) {
      return res
        .status(400)
        .json({ success: false, message: "recipientId is required" });
    }

    const result = await NotificationModel.getNotificationByRecipientId(
      recipientId
    );

    return res.status(200).json({
      success: true,
      notifications: result,
    });
  } catch (error) {
    next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    const recipientId = Number(req.params.recipientId);

    await NotificationModel.updateReadNotification(recipientId);

    res.status(200).json({
      success: true,
      message: "Read notification successfully",
    });
  } catch (error) {
    next(error);
  }
};

const responseFriendRequestNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fromUserId, notificationId, type } = req.body;

    await NotificationModel.removeNotification(notificationId);

    if (type === "decline") {
      return res.status(200).json({
        success: true,
        message: "Decline friend request",
      });
    }

    const notificationToRecipient = {
      recipient_id: userId,
      sender_id: fromUserId,
      type: "friend_accepted",
      entity_type: "user",
      entity_id: fromUserId,
      content: "and you are now friends",
    };

    await NotificationModel.addNotification(notificationToRecipient);

    publishDirect(
      "friend_request_pubsub",
      "friend_response",
      JSON.stringify({
        sender_id: userId,
        recipient_id: fromUserId,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Accept friend request",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllNotification,
  readNotification,
  responseFriendRequestNotification,
};
