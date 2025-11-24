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

      if (rows.length == 0) return null;

      return rows[0];
    } catch (error) {}
  },
};

export default CommentModel;
