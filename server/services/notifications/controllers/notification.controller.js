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

export { getAllNotification, readNotification };
