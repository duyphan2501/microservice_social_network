import { pool } from "../database/connectDB.js";

const UserModel = {
  getUserByUserName: async (username) => {
    const query = "SELECT * FROM users WHERE username = ? LIMIT 1";
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0] : null;
  },

  getUserByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = ? LIMIT 1";
    const [rows] = await pool.query(query, [email]);
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

  checkRefreshToken: async (userId, refreshToken) => {
    const query = "SELECT * FROM users WHERE id = ? AND refresh_token = ? AND refresh_token_expires_at > NOW() LIMIT 1";
    const [rows] = await pool.query(query, [userId, refreshToken]);
    return rows.length > 0 ? rows[0] : null;
  },
};

export default UserModel;
