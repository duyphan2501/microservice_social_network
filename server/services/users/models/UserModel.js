import { pool } from "../database/connectDB.js";
import { sendForgotPasswordEmail } from "../helpers/email.helper.js";

const UserModel = {
  addUser: async (userData) => {
    const query = `
    INSERT INTO users (username, email, password_hash, full_name)
    VALUES (?, ?, ?, ?)
  `;

    const { username, email, password, fullname } = userData;

    const [result] = await pool.query(query, [
      username,
      email,
      password,
      fullname,
    ]);

    const user = await UserModel.getUserById(result.insertId);

    return user;
  },

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

  getUserById: async (userId) => {
    const query = "SELECT * FROM users WHERE id = ? LIMIT 1";
    const [rows] = await pool.query(query, [userId]);
    return rows.length > 0 ? rows[0] : null;
  },

  getUserByForgotpasswordToken: async (token) => {
    const query = `
      SELECT U.*, SUT.expires_at AS token_expires_at
      FROM users U
      JOIN single_use_tokens SUT ON U.id = SUT.user_id
      WHERE SUT.token = ? AND SUT.type = 'RESET_PASSWORD' AND SUT.is_used = FALSE
    `;

    const [rows] = await pool.query(query, [token]);
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
    const query =
      "SELECT * FROM users WHERE id = ? AND refresh_token = ? AND refresh_token_expires_at > NOW() LIMIT 1";
    const [rows] = await pool.query(query, [userId, refreshToken]);
    return rows.length > 0 ? rows[0] : null;
  },

  updateLastActive: async (userId, timestamp) => {
    const query = `
    UPDATE users 
    SET last_active_at = ?
    WHERE id = ?
  `;
    const [result] = await pool.query(query, [timestamp, userId]);
    return result.affectedRows;
  },

  sendForgotPasswordEmailtoUser: async (user) => {
    const minutes = 10;
    const token = await sendForgotPasswordEmail(
      user.full_name,
      user.email,
      minutes
    );
    const tokenExpiresAt = new Date(Date.now() + 60 * 1000 * minutes);

    const queryAddForgotToken = `
      INSERT INTO single_use_tokens(user_id, token, type, expires_at)
      VALUES (?, ?, 'RESET_PASSWORD', ?)
    `;

    await pool.query(queryAddForgotToken, [user.id, token, tokenExpiresAt]);
  },

  updateUserPassword: async (userId, newPassword) => {
    const query = `
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(query, [newPassword, userId]);
    return result.affectedRows;
  },

  updateTokenAsUsed: async (token) => {
    const query = `
      UPDATE single_use_tokens
      SET is_used = TRUE
      WHERE token = ?
    `;
    const [result] = await pool.query(query, [token]);
    return result.affectedRows;
  },

  searchUsers: async (query, limit = 20, offset = 0) => {
    try {
      const sql = `
        SELECT 
          id as userId,
          username,
          full_name as fullName,
          avatar_url as avatarUrl,
          email,
          last_active_at as lastActive
        FROM users
        WHERE 
          (username LIKE ? OR full_name LIKE ? OR email LIKE ?)
        ORDER BY username ASC
        LIMIT ? OFFSET ?
      `;

      const searchPattern = `%${query}%`;
      const [rows] = await pool.query(sql, [
        searchPattern,
        searchPattern,
        searchPattern,
        parseInt(limit),
        parseInt(offset),
      ]);

      return rows;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },

  countSearchResults: async (query) => {
    try {
      const sql = `
        SELECT COUNT(*) as total
        FROM users
        WHERE 
          (username LIKE ? OR full_name LIKE ? OR email LIKE ?)
      `;

      const searchPattern = `%${query}%`;
      const [rows] = await pool.query(sql, [
        searchPattern,
        searchPattern,
        searchPattern,
      ]);

      return rows[0].total;
    } catch (error) {
      console.error("Error counting search results:", error);
      return 0;
    }
  },

  updateUserInfo: async (userId, fullname, username, bio, avatar_url) => {
    const query = `
      UPDATE users
      set full_name = ?, username = ?, bio = ?, avatar_url = ?
      where id = ?
    `;

    const [result] = await pool.query(query, [
      fullname,
      username,
      bio,
      avatar_url,
      userId,
    ]);

    return result.affectedRows;
  },
};

export default UserModel;
