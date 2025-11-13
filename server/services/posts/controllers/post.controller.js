import PostModel from "../models/post.model.js";

const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await PostModel.getPostsWithMedia(limit, offset);

    res.status(200).json({
      message: "Lấy bài viết thành công",
      posts,
    });
  } catch (error) {
    next(error);
  }
};

export { getPosts };
