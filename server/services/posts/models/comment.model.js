import { pool } from "../database/connectDB.js";

const CommentModel = {
  getCommentById: async (commentId) => {
    try {
      const query = `
                SELECT *
                FROM COMMENTS
                WHERE id = ?
            `;

      const [rows] = await pool.execute(query, [commentId]);

      if (rows.length == 0) return [];

      return rows;
    } catch (error) {}
  },
};

export default CommentModel;
