// messages/friendRequestHandlers.js
import { consumeQueue } from "./rabbitMQ.js";
import { pool } from "../database/connectDB.js";

// Helper: Get user by ID
const getUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, username, email, full_name, avatar_url, bio, created_at 
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Helper: Get users by IDs
const getUsersByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await pool.execute(
    `SELECT id, username, email, full_name, avatar_url, bio, created_at 
     FROM users WHERE id IN (${placeholders})`,
    ids
  );
  return rows;
};

// Helper: Search users
const searchUsers = async (query, limit, offset) => {
  const searchTerm = `%${query}%`;

  const [rows] = await pool.execute(
    `SELECT id, username, email, full_name, avatar_url, bio, created_at 
     FROM users 
     WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
     ORDER BY username
     LIMIT ? OFFSET ?`,
    [searchTerm, searchTerm, searchTerm, limit, offset]
  );

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) as total FROM users 
     WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?`,
    [searchTerm, searchTerm, searchTerm]
  );

  return { users: rows, total };
};

// Setup message queue handlers
export const setupFriendRequestHandlers = async () => {
  console.log("🔧 Setting up Friend Service request handlers...");

  // Handler: Get user by ID
  await consumeQueue("user.get_by_id", async (message) => {
    try {
      const { userId } = JSON.parse(message);
      const user = await getUserById(userId);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error("Error in user.get_by_id:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  });

  // Handler: Get users by IDs
  await consumeQueue("user.get_by_ids", async (message) => {
    try {
      const { userIds } = JSON.parse(message);
      const users = await getUsersByIds(userIds);

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error("Error in user.get_by_ids:", error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  });

  // Handler: Search users
  await consumeQueue("user.search", async (message) => {
    try {
      const { query, limit = 20, offset = 0 } = JSON.parse(message);
      const result = await searchUsers(query, limit, offset);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error in user.search:", error);
      return {
        success: false,
        data: { users: [], total: 0 },
        error: error.message,
      };
    }
  });

  // Handler: Verify user exists
  await consumeQueue("user.verify_exists", async (message) => {
    try {
      const { userId } = JSON.parse(message);
      const user = await getUserById(userId);

      return {
        success: true,
        exists: !!user,
      };
    } catch (error) {
      console.error("Error in user.verify_exists:", error);
      return {
        success: false,
        exists: false,
        error: error.message,
      };
    }
  });

  console.log("✅ Friend Service request handlers setup complete");
};
