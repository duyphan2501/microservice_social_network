import express from "express";
import { checkAuth, optionAuth } from "../middlewares/auth.middleware.js";

import {
  addComment,
  createNewPost,
  deletePost,
  getPost,
  getPostComments,
  getPosts,
  saveLike,
  uploadPostMedia,
} from "../controllers/post.controller.js";
import { uploadMedia } from "../middlewares/cloudinary.middleware.js";

const postRouter = express.Router();

postRouter.get("/", optionAuth, getPosts);
postRouter.post("/create", checkAuth, createNewPost);
postRouter.delete("/delete/:id", checkAuth, deletePost);
postRouter.post(
  "/upload-media",
  checkAuth,
  uploadMedia.array("mediaFiles", 10),
  uploadPostMedia
);
postRouter.post("/:postId/like", checkAuth, saveLike);
postRouter.post("/comments/add", checkAuth, addComment);

postRouter.get("/:id/comments", getPostComments);
postRouter.get("/:id", optionAuth, getPost);

export default postRouter;
