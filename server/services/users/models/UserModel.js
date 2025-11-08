import { pool } from "../database/connectDB.js";

const UserModel = {
  getUserByUserName: async (username) => {
    const query = "SELECT * FROM users WHERE username = ? LIMIT 1";
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0] : null;
  },

  setRefreshToken: async (userId, token, tokenExpiresAt) => {
    const query = `
    UPDATE users 
    SET refresh_token = ?, refresh_token_expires_at = ?
    WHERE id = ?
  `;
    const [result] = await pool.query(query, [token, tokenExpiresAt, userId]);
    return result.affectedRows;
  },
};

export default UserModel;
