import createHttpError from "http-errors";
import PostModel from "../models/post.model.js";
import { uploadFiles, uploadVideoLarge } from "../helpers/upload.js";
import { publishDirect, sendQueue } from "../messages/rabbitMQ.js";
import CommentModel from "../models/comment.model.js";

const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.query.userId || 0;
    const currentUserId = req.user?.userId || req.query.userId || 0;
    const posts = await PostModel.getPostsWithMedia(limit, offset, userId, currentUserId);
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

    if (!id) throw createHttpError.BadRequest("Post ID is required");
    const userId = req.user?.userId || req.query.userId || 0;

    const post = await PostModel.getPostById(id, userId);
    if (!post) throw createHttpError.NotFound("Post is deleted or not exist");

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

    const post = await PostModel.getPostById(postId);

    publishDirect(
      "post_events_pubsub",
      "post_friend_create",
      JSON.stringify(post)
    );
    return res.status(201).json({
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

const saveLike = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId || 0, 10);
    const userId = req.user?.userId;

    if (postId === 0) throw createHttpError.BadRequest("Post ID is required");
    // const post = await PostModel.getPostById(postId, userId);
    // if (!post) throw createHttpError.NotFound("Post is deleted or not exist");

    const result = await PostModel.toggleLike(postId, userId);

    if (result.liked === true) {
      const post = await PostModel.getPostById(postId, userId);
      if (post.user_id !== userId) {
        publishDirect(
          "post_events_pubsub",
          "post_friend_like",
          JSON.stringify({
            sender: userId,
            post,
          })
        );
      }
    }

    await publishDirect(
      "post_events_pubsub",
      "post_like_updated",
      JSON.stringify({ likes_count: result.likes_count, postId })
    );

    return res.status(200).json({
      liked: result.liked,
      likes_count: result.likes_count,
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { postId, parentId, content } = req.body;
    const userId = req.user?.userId || 0;

    if (!postId) throw createHttpError.BadRequest("Post ID is required");
    const post = await PostModel.getPostById(postId, userId);

    if (!post) throw createHttpError.NotFound("Post is deleted or not exist");
    if (!content) throw createHttpError.BadRequest("Please enter content");

    const comment = await PostModel.addNewComment(
      postId,
      parentId,
      content,
      userId
    );

    if (post.user_id !== userId) {
      if (parentId) {
        const getParentComment = await CommentModel.getCommentById(parentId);
        if (getParentComment?.user_id !== comment.user_id) {
          publishDirect(
            "post_events_pubsub",
            "post_friend_comment",
            JSON.stringify({
              sender: userId,
              post,
              content,
              parentUserId: getParentComment?.user_id || null,
            })
          );
        }
      } else {
        const getParentComment = await CommentModel.getCommentById(parentId);
        publishDirect(
          "post_events_pubsub",
          "post_friend_comment",
          JSON.stringify({
            sender: userId,
            post,
            content,
            parentUserId: getParentComment?.user_id || null,
          })
        );
      }
    } else {
      if (parentId) {
        const getParentComment = await CommentModel.getCommentById(parentId);
        if (getParentComment?.user_id !== comment.user_id) {
          publishDirect(
            "post_events_pubsub",
            "post_friend_comment",
            JSON.stringify({
              sender: userId,
              post,
              content,
              parentUserId: getParentComment?.user_id || null,
            })
          );
        }
      }
    }

    await publishDirect(
      "post_events_pubsub",
      "post_comment_created",
      JSON.stringify({ postId, comment })
    );

    return res
      .status(201)
      .json({ message: "Add comment sucessfully", comment });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || 0;

    if (!id) throw createHttpError.BadRequest("Post ID is required");
    const result = await PostModel.deletePostById(id, userId);

    if (!result)
      throw createHttpError.Forbidden(
        "You are not allowed to delete this post"
      );
    return res.status(200).json({
      message: "Delete post successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getPosts,
  getPost,
  getPostComments,
  createNewPost,
  uploadPostMedia,
  saveLike,
  addComment,
  deletePost,
};
