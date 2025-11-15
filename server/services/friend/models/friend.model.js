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

  // Huỷ kết bạn
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

    const [rows] = await pool.execute(query, [
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

  // Gợi ý bạn bè (users chưa là bạn, có bạn chung)
  async getSuggestedFriends(userId, limit = 20) {
    const query = `
      SELECT DISTINCT 
        suggested_user_id,
        mutual_count
      FROM (
        SELECT 
          CASE 
            WHEN fr2.user_id_1 = fr1_friend_id THEN fr2.user_id_2 
            ELSE fr2.user_id_1 
          END as suggested_user_id,
          COUNT(*) as mutual_count
        FROM (
          SELECT 
            CASE 
              WHEN user_id_1 = ? THEN user_id_2 
              ELSE user_id_1 
            END as fr1_friend_id
          FROM friend_relationships 
          WHERE (user_id_1 = ? OR user_id_2 = ?) 
            AND status = 'accepted'
        ) as my_friends
        JOIN friend_relationships fr2 
          ON (fr2.user_id_1 = my_friends.fr1_friend_id OR fr2.user_id_2 = my_friends.fr1_friend_id)
          AND fr2.status = 'accepted'
        WHERE CASE 
                WHEN fr2.user_id_1 = my_friends.fr1_friend_id THEN fr2.user_id_2 
                ELSE fr2.user_id_1 
              END != ?
        GROUP BY suggested_user_id
      ) as suggestions
      WHERE suggested_user_id NOT IN (
        SELECT 
          CASE 
            WHEN user_id_1 = ? THEN user_id_2 
            ELSE user_id_1 
          END
        FROM friend_relationships 
        WHERE (user_id_1 = ? OR user_id_2 = ?)
      )
      ORDER BY mutual_count DESC, suggested_user_id
      LIMIT ?
    `;

    const [rows] = await pool.execute(query, [
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
      userId,
      limit,
    ]);
    return rows;
  },

  // Kiểm tra xem 2 users có phải bạn bè không
  async areFriends(userId1, userId2) {
    const [minId, maxId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const query = `
      SELECT 1 FROM friend_relationships 
      WHERE user_id_1 = ? AND user_id_2 = ? AND status = 'accepted'
      LIMIT 1
    `;

    const [rows] = await pool.execute(query, [minId, maxId]);
    return rows.length > 0;
  },

  // Lấy danh sách mutual friends
  async getMutualFriends(userId1, userId2, limit = 50) {
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
      userId1,
      userId2,
      userId2,
      userId1,
      userId1,
      userId1,
      userId1,
      limit,
    ]);
    return rows;
  },
};

export default FriendModel;
