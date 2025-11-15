import createHttpError from "http-errors";
import PostModel from "../models/post.model.js";
import { uploadFiles, uploadVideoLarge } from "../helpers/upload.js";

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

const createNewPost = async (req, res, next) => {
  try {
    const { content, media } = req.body;

    if (!content && media.length === 0)
      throw createHttpError.BadRequest(
        "Vui lòng nhập nội dung bài viết hoặc ảnh/video"
      );
    const userId = req.user.userId;

    const postId = await PostModel.createPost(content, media, userId);
    if (!postId)
      throw createHttpError.createHttpError("Thêm dữ liệu vào DB thất bại");

    return res.status(200).json({
      message: "Tạo bài viết thành công",
      postId,
    });
  } catch (error) {
    next(error);
  }
};

const POST_IMAGES_FOLDER = "post_images";
const POST_VIDEOS_FOLDER = "post_videos";

const uploadPostMedia = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      throw createHttpError.BadRequest("Không có file nào được cung cấp.");
    }

    const images = files.filter((file) => file.mimetype.startsWith("image"));
    const videos = files.filter((file) => file.mimetype.startsWith("video"));

    let uploadedMedia = [];

    if (images.length > 0) {
      const options = {
        folder: POST_IMAGES_FOLDER,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };
      const imageResults = await uploadFiles(images, options);
      const mappedImages = imageResults.map((item) => ({
        media_url: item.url,
        media_public_id: item.publicId,
        media_type: "image",
      }));
      uploadedMedia.push(...mappedImages);
    }

    if (videos.length > 0) {
      const options = {
        folder: POST_VIDEOS_FOLDER,
        resource_type: "video",
        quality: "auto",
        fetch_format: "auto",
      };
      const videoResults = await uploadVideoLarge(videos, options);
      const mappedVideos = videoResults.map((item) => ({
        media_url: item.url,
        media_public_id: item.publicId,
        media_type: "video",
      }));
      uploadedMedia.push(...mappedVideos);
    }
    res.status(200).json({
      message: "Upload thành công",
      uploadedMedia: uploadedMedia,
    });
  } catch (error) {
    next(error);
  }
};

export { getPosts, getPost, getPostComments, createNewPost, uploadPostMedia };
