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
    const [posts] = await pool.query(postsQuery, [currentUserId, limit, offset]);

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
};

export default PostModel;
