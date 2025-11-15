import express from "express";
import checkAuth from "../middlewares/checkAuth.js";

import { uploadImg } from "../middlewares/cloudinary.middleware.js";
import { uploadMessageImages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.post(
  "/upload-images",
  uploadImg.array("message_images"),
  uploadMessageImages
);

export default messageRouter;
