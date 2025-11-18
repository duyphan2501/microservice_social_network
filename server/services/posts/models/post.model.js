import { pool } from "../database/connectDB.js";

const PostModel = {
  getPostsWithMedia: async (limit, offset, currentUserId) => {
    // 1. Lấy danh sách bài đăng + trạng thái đã like chưa
    const postsQuery = `
      SELECT 
          p.*, 
          EXISTS (
            SELECT 1 FROM likes l 
            WHERE l.post_id = p.id AND l.user_id = ?
          ) AS isLiked
      FROM posts p
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;
    const [posts] = await pool.query(postsQuery, [
      currentUserId,
      limit,
      offset,
    ]);

    if (posts.length === 0) return [];

    // 2. Lấy media
    const postIds = posts.map((post) => post.id);
    const mediaQuery = `
      SELECT post_id, media_url, media_type, display_order 
      FROM post_media 
      WHERE post_id IN (?)
      ORDER BY display_order ASC
    `;
    const [mediaResults] = await pool.query(mediaQuery, [postIds]);

    // 3. Gộp media vào bài đăng
    const postsWithMedia = posts.map((post) => {
      const relatedMedia = mediaResults.filter((m) => m.post_id === post.id);
      return { ...post, media: relatedMedia };
    });

    return postsWithMedia;
  },

  getPostById: async (postId, currentUserId) => {
    const query = `
      SELECT 
          p.*,
          EXISTS (
            SELECT 1 FROM likes l 
            WHERE l.post_id = p.id AND l.user_id = ?
          ) AS isLiked
      FROM posts p
      WHERE p.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [currentUserId, postId]);

    if (rows.length === 0) return null;

    const post = rows[0];

    const mediaQuery = `
      SELECT post_id, media_url, media_type, display_order 
      FROM post_media 
      WHERE post_id = ?
      ORDER BY display_order ASC
    `;
    const [mediaResult] = await pool.query(mediaQuery, [postId]);

    return { ...post, media: mediaResult || [] };
  },

  getPostCommentsById: async (postId) => {
    const query = `
      SELECT *
      FROM comments
      WHERE post_id = ?
      ORDER BY id ASC
    `;
    const [rows] = await pool.query(query, [postId]);
    return rows;
  },

  createPost: async (content, media, userId) => {
    const postQuery = `INSERT INTO posts (user_id, content, likes_count, comments_count)  
                     VALUES (?, ?, ?, ?)`;
    const [postResult] = await pool.query(postQuery, [userId, content, 0, 0]);

    const postId = postResult.insertId;

    if (postId && media.length > 0) {
      const mediaValues = media.map((mediaItem, index) => [
        postId,
        mediaItem.media_url,
        mediaItem.media_public_id,
        mediaItem.media_type,
        mediaItem.display_order || index + 1,
      ]);

      const mediaQuery = `
      INSERT INTO post_media (post_id, media_url, media_public_id, media_type, display_order)
      VALUES ?
    `;

      await pool.query(mediaQuery, [mediaValues]);
    }

    return postId;
  },

  toggleLike: async (postId, userId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Kiểm tra đã like chưa
      const [rows] = await connection.query(
        `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`,
        [postId, userId]
      );

      let liked = false;

      if (rows.length > 0) {
        // Unlike
        await connection.query(
          `DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
          [postId, userId]
        );

        await connection.query(
          `UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?`,
          [postId]
        );

        liked = false;
      } else {
        // Like
        await connection.query(
          `INSERT INTO likes (post_id, user_id) VALUES (?, ?)`,
          [postId, userId]
        );

        await connection.query(
          `UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?`,
          [postId]
        );

        liked = true;
      }

      // Lấy likes_count mới nhất để trả về FE hoặc emit socket
      const [[post]] = await connection.query(
        `SELECT likes_count FROM posts WHERE id = ?`,
        [postId]
      );

      await connection.commit();

      return {
        liked,
        likes_count: post.likes_count,
      };
    } catch (err) {
      await connection.rollback();
      console.error("Toggle like error:", err);
      throw err;
    } finally {
      connection.release();
    }
  },

  addNewComment: async (postId, parentId = null, content, userId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const insertQuery = `
      INSERT INTO comments (post_id, parent_comment_id, content, user_id, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

      const insertValues = [postId, parentId, content, userId];

      const [insertResult] = await connection.query(insertQuery, insertValues);

      const newCommentId = insertResult.insertId;

      // Add this query to increment the comments_count in the posts table
      const updateCountQuery = `
      UPDATE posts
      SET comments_count = comments_count + 1
      WHERE id = ?
    `;

      await connection.query(updateCountQuery, [postId]);

      const [rows] = await connection.query(
        `SELECT * FROM comments WHERE id = ?`,
        [newCommentId]
      );

      if (rows.length === 0) {
        throw new Error("Failed to retrieve the newly added comment.");
      }

      const newComment = rows[0];
      await connection.commit();

      return newComment;
    } catch (err) {
      await connection.rollback();
      console.error("Add comment error:", err);
      throw err;
    } finally {
      connection.release();
    }
  },
};

export default PostModel;
