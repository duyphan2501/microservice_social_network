import {
  getAllNotification,
  readNotification,
  responseFriendRequestNotification,
} from "../controllers/notification.controller.js";
import checkAuth from "../middlewares/checkAuth.js";
import express from "express";

const notificationRouter = express.Router();

notificationRouter.put("/read-notification/:recipientId", readNotification);
notificationRouter.post(
  "/response/friend-request",
  checkAuth,
  responseFriendRequestNotification
);
notificationRouter.get("/:recipientId", getAllNotification);

export default notificationRouter;
