// models/friend.model.js
import { pool } from "../database/connectDB.js";

const FriendModel = {
  // Gửi lời mời kết bạn
  async sendFriendRequest(userId1, userId2) {
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const query = `
      INSERT INTO friend_relationships (user_id_1, user_id_2, status, action_user_id)
      VALUES (?, ?, 'pending', ?)
      ON DUPLICATE KEY UPDATE 
        status = IF(status = 'declined', 'pending', status),
        action_user_id = ?,
        updated_at = CURRENT_TIMESTAMP
    `;

    const [result] = await pool.execute(query, [
      minId,
      maxId,
      userId1,
      userId1,
    ]);
    return result;
  },

  // Kiểm tra trạng thái quan hệ giữa 2 users
  async getFriendshipStatus(userId1, userId2) {
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const query = `
      SELECT * FROM friend_relationships 
      WHERE user_id_1 = ? AND user_id_2 = ?
    `;

    const [rows] = await pool.execute(query, [minId, maxId]);
    return rows[0] || null;
  },

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(userId1, userId2) {
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const query = `
      UPDATE friend_relationships 
      SET status = 'accepted', action_user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id_1 = ? AND user_id_2 = ? AND status = 'pending'
    `;

    const [result] = await pool.execute(query, [userId1, minId, maxId]);
    return result;
  },

  // Từ chối lời mời kết bạn
  async declineFriendRequest(userId1, userId2) {
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const query = `
      UPDATE friend_relationships 
      SET status = 'declined', action_user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id_1 = ? AND user_id_2 = ? AND status = 'pending'
    `;

    const [result] = await pool.execute(query, [userId1, minId, maxId]);
    return result;
  },

  // Hủy kết bạn
  async unfriend(userId1, userId2) {
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const query = `
      DELETE FROM friend_relationships 
      WHERE user_id_1 = ? AND user_id_2 = ? AND status = 'accepted'
    `;

    const [result] = await pool.execute(query, [minId, maxId]);
    return result;
  },

  // Block user
  async blockUser(userId, blockedUserId) {
    const [minId, maxId] =
      userId < blockedUserId
        ? [userId, blockedUserId]
        : [blockedUserId, userId];

    const query = `
      INSERT INTO friend_relationships (user_id_1, user_id_2, status, action_user_id)
      VALUES (?, ?, 'blocked', ?)
      ON DUPLICATE KEY UPDATE 
        status = 'blocked',
        action_user_id = ?,
        updated_at = CURRENT_TIMESTAMP
    `;

    const [result] = await pool.execute(query, [minId, maxId, userId, userId]);
    return result;
  },

  // Lấy danh sách bạn bè (chỉ trả về friend IDs)
  async getFriendsList(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        CASE 
          WHEN user_id_1 = ? THEN user_id_2 
          ELSE user_id_1 
        END as friend_id,
        created_at,
        updated_at
      FROM friend_relationships 
      WHERE (user_id_1 = ? OR user_id_2 = ?) 
        AND status = 'accepted'
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [
      userId,
      userId,
      userId,
      limit,
      offset,
    ]);
    return rows;
  },

  // Lấy danh sách lời mời kết bạn đã nhận
  async getReceivedFriendRequests(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        CASE 
          WHEN user_id_1 = ? THEN user_id_2 
          ELSE user_id_1 
        END as from_user_id,
        action_user_id,
        created_at,
        updated_at
      FROM friend_relationships 
      WHERE (user_id_1 = ? OR user_id_2 = ?) 
        AND status = 'pending'
        AND action_user_id != ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [
      userId,
      userId,
      userId,
      userId,
      limit,
      offset,
    ]);
    return rows;
  },

  // Lấy danh sách lời mời kết bạn đã gửi
  async getSentFriendRequests(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        CASE 
          WHEN user_id_1 = ? THEN user_id_2 
          ELSE user_id_1 
        END as to_user_id,
        created_at,
        updated_at
      FROM friend_relationships 
      WHERE (user_id_1 = ? OR user_id_2 = ?) 
        AND status = 'pending'
        AND action_user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(query, [
      userId,
      userId,
      userId,
      userId,
      limit,
      offset,
    ]);
    return rows;
  },

  // Đếm số lượng bạn bè
  async getFriendsCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM friend_relationships 
      WHERE (user_id_1 = ? OR user_id_2 = ?) 
        AND status = 'accepted'
    `;

    const [rows] = await pool.execute(query, [userId, userId]);
    return rows[0].count;
  },

  // Đếm số lượng lời mời chờ
  async getPendingRequestsCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM friend_relationships 
      WHERE (user_id_1 = ? OR user_id_2 = ?) 
        AND status = 'pending'
        AND action_user_id != ?
    `;

    const [rows] = await pool.execute(query, [userId, userId, userId]);
    return rows[0].count;
  },

  // Gợi ý bạn bè (users chưa là bạn, có bạn chung) - Simplified version
  getSuggestedFriends: async (userId, limit = 20) => {
    const limitInt = parseInt(limit, 10);

    // Step 1: Get all my friends
    const [myFriends] = await pool.execute(
      `SELECT 
        CASE 
          WHEN user_id_1 = ? THEN user_id_2
          ELSE user_id_1
        END AS friend_id
      FROM friend_relationships
      WHERE (user_id_1 = ? OR user_id_2 = ?)
        AND status = 'accepted'`,
      [userId, userId, userId]
    );

    if (myFriends.length === 0) {
      return [];
    }

    const myFriendIds = myFriends.map((f) => f.friend_id);

    // Step 2: Get friends of friends (excluding myself and existing friends)
    const placeholders = myFriendIds.map(() => "?").join(",");

    const sql = `
      SELECT 
        CASE 
          WHEN user_id_1 IN (${placeholders}) THEN user_id_2
          ELSE user_id_1
        END AS suggested_user_id,
        COUNT(*) AS mutual_count
      FROM friend_relationships
      WHERE ((user_id_1 IN (${placeholders}) OR user_id_2 IN (${placeholders}))
        AND status = 'accepted')
      GROUP BY suggested_user_id
      HAVING suggested_user_id != ?
        AND suggested_user_id NOT IN (${placeholders})
      ORDER BY mutual_count DESC, suggested_user_id
      LIMIT ?
    `;

    const params = [
      ...myFriendIds, // for first CASE
      ...myFriendIds, // for WHERE user_id_1 IN
      ...myFriendIds, // for WHERE user_id_2 IN
      userId, // for HAVING != ?
      ...myFriendIds, // for HAVING NOT IN
      limitInt, // for LIMIT
    ];

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // Lấy danh sách mutual friends
  async getMutualFriends(userId1, userId2, limit = 50) {
    try {
      const user1 = parseInt(userId1);
      const user2 = parseInt(userId2);
      const limitInt = parseInt(limit);

      if (isNaN(user1) || isNaN(user2) || isNaN(limitInt)) {
        return [];
      }

      console.log("🔍 Getting mutual friends:", { user1, user2, limitInt });

      const query = `
      SELECT 
        CASE 
          WHEN fr1.user_id_1 = ? THEN fr1.user_id_2 
          ELSE fr1.user_id_1 
        END as mutual_friend_id
      FROM friend_relationships fr1
      INNER JOIN friend_relationships fr2 
        ON (
          (fr2.user_id_1 = ? OR fr2.user_id_2 = ?)
          AND fr2.status = 'accepted'
          AND (
            (fr1.user_id_1 = ? AND (fr2.user_id_1 = fr1.user_id_2 OR fr2.user_id_2 = fr1.user_id_2))
            OR
            (fr1.user_id_2 = ? AND (fr2.user_id_1 = fr1.user_id_1 OR fr2.user_id_2 = fr1.user_id_1))
          )
        )
      WHERE (fr1.user_id_1 = ? OR fr1.user_id_2 = ?)
        AND fr1.status = 'accepted'
      LIMIT ?
    `;

      const [rows] = await pool.execute(query, [
        user1,
        user2,
        user2,
        user1,
        user1,
        user1,
        user1,
        limitInt,
      ]);

      return rows;
    } catch (error) {
      return [];
    }
  },

  async countFriends(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM friend_relationships 
      WHERE (user_id_1 = ? OR user_id_2 = ?) 
        AND status = 'accepted'
    `;

    const [rows] = await pool.execute(query, [userId, userId]);
    return rows[0].count;
  },
};

export default FriendModel;
