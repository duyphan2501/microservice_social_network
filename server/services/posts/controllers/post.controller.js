import createHttpError from "http-errors";
import PostModel from "../models/post.model.js";

const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user?.userId || 0;
    const posts = await PostModel.getPostsWithMedia(limit, offset, userId);

    res.status(200).json({
      posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) throw createHttpError.BadRequest("Thiếu mã bài viết");
    const userId = req.user?.userId || 0;

    const post = await PostModel.getPostById(id, userId);

    return res.status(200).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) throw createHttpError.BadRequest("Thiếu mã bài viết");

    const comments = await PostModel.getPostCommentsById(id);

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    next(error);
  }
};

export { getPosts, getPost, getPostComments };
