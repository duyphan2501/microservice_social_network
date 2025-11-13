import { pool } from "../database/connectDB.js";

const PostModel = {
  getPostsWithMedia: async (limit, offset) => {
    // 1. Lấy danh sách các bài đăng chính
    const postsQuery = `
        SELECT * FROM posts 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
    `;
    const [posts] = await pool.query(postsQuery, [limit, offset]);

    if (posts.length === 0) {
      return [];
    }

    // Lấy danh sách các ID của bài đăng vừa lấy được (ví dụ: [1, 2, 3])
    const postIds = posts.map((post) => post.id);

    // 2. Lấy tất cả media liên quan đến các post IDs đó
    const mediaQuery = `
        SELECT post_id, media_url, media_type, display_order 
        FROM post_media 
        WHERE post_id IN (?)
        ORDER BY display_order ASC
    `;
    const [mediaResults] = await pool.query(mediaQuery, [postIds]);

    // 3. Ghép dữ liệu media vào từng bài đăng tương ứng
    const postsWithMedia = posts.map((post) => {
      const relatedMedia = mediaResults.filter(
        (media) => media.post_id === post.id
      );

      return {
        ...post,
        media: relatedMedia,
      };
    });

    return postsWithMedia;
  },
};

export default PostModel;
