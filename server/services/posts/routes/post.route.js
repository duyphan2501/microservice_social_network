import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import { uploadImg } from "../middlewares/cloudinary.middleware.js";
import {
  getPost,
  getPostComments,
  getPosts,
} from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.get("/", checkAuth, getPosts);
postRouter.get("/:id", checkAuth, getPost);
postRouter.get("/:id/comments", getPostComments);

export default postRouter;
