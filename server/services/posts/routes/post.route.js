import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import {
  createNewPost,
  getPost,
  getPostComments,
  getPosts,
  uploadPostMedia,
} from "../controllers/post.controller.js";
import { uploadMedia } from "../middlewares/cloudinary.middleware.js";

const postRouter = express.Router();

postRouter.get("/", getPosts);
postRouter.post("/create", checkAuth, createNewPost);
postRouter.post(
  "/upload-media",
  checkAuth,
  uploadMedia.array("mediaFiles", 10),
  uploadPostMedia
);

postRouter.get("/:id/comments", getPostComments);
postRouter.get("/:id", getPost);

export default postRouter;
