import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import { uploadImg } from "../middlewares/cloudinary.middleware.js";
import { getPosts } from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.get("/", getPosts);

export default postRouter;
