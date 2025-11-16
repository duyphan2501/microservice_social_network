import express from "express";
import checkAuth from "../middlewares/checkAuth.js";

import { uploadImg } from "../middlewares/cloudinary.middleware.js";
import {
  sendMessage,
  updateMessageStatus,
  uploadMessageImages,
} from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.post(
  "/upload-images",
  uploadImg.array("message_images"),
  uploadMessageImages
);

messageRouter.post("/send", checkAuth, sendMessage);
messageRouter.post("/status", checkAuth, updateMessageStatus);

export default messageRouter;
