// controllers/search.controller.js
import FriendModel from "../models/friend.model.js";
import db from "../database/db.js";

const SearchController = {
  // Tìm kiếm users (giả sử có bảng users trong database)
  async searchUsers(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { query = "", limit = 20, offset = 0 } = req.query;

      // Query tìm kiếm users theo username, displayName, email, etc.
      // Giả sử bạn có bảng users với các field: id, username, display_name, email, avatar, bio
      const searchQuery = `
        SELECT 
          u.id,
          u.username,
          u.display_name as displayName,
          u.avatar,
          u.bio,
          u.created_at,
          -- Kiểm tra trạng thái friendship
          CASE 
            WHEN fr.status = 'accepted' THEN 'friend'
            WHEN fr.status = 'pending' AND fr.action_user_id = ? THEN 'request_sent'
            WHEN fr.status = 'pending' AND fr.action_user_id != ? THEN 'request_received'
            WHEN fr.status = 'blocked' THEN 'blocked'
            ELSE 'none'
          END as friendshipStatus,
          fr.action_user_id as friendshipActionUserId
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id_1,
            user_id_2,
            status,
            action_user_id,
            CASE 
              WHEN user_id_1 = ? THEN user_id_2
              WHEN user_id_2 = ? THEN user_id_1
            END as other_user_id
          FROM friend_relationships
          WHERE (user_id_1 = ? OR user_id_2 = ?)
        ) fr ON u.id = fr.other_user_id
        WHERE u.id != ?
          AND (
            ? = '' 
            OR u.username LIKE ?
            OR u.display_name LIKE ?
            OR u.email LIKE ?
          )
        ORDER BY 
          -- Ưu tiên hiển thị bạn chung
          CASE WHEN fr.status = 'accepted' THEN 0 ELSE 1 END,
          u.username
        LIMIT ? OFFSET ?
      `;

      const searchTerm = `%${query}%`;
      const [users] = await db.execute(searchQuery, [
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        query,
        searchTerm,
        searchTerm,
        searchTerm,
        parseInt(limit),
        parseInt(offset),
      ]);

      // Lấy mutual friends count cho mỗi user
      const usersWithMutualCount = await Promise.all(
        users.map(async (user) => {
          const mutualFriends = await FriendModel.getMutualFriends(
            currentUserId,
            user.id,
            5
          );

          return {
            ...user,
            mutualFriendsCount: mutualFriends.length,
            mutualFriends: mutualFriends.slice(0, 3), // Chỉ lấy 3 mutual friends đầu tiên để hiển thị
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          users: usersWithMutualCount,
          query: query,
          hasMore: users.length === parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search users",
      });
    }
  },

  // Tìm kiếm chỉ trong bạn bè
  async searchFriends(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { query = "", limit = 20, offset = 0 } = req.query;

      const searchQuery = `
        SELECT 
          u.id,
          u.username,
          u.display_name as displayName,
          u.avatar,
          u.bio,
          fr.created_at as friendSince
        FROM users u
        INNER JOIN friend_relationships fr 
          ON (
            (fr.user_id_1 = ? AND fr.user_id_2 = u.id)
            OR
            (fr.user_id_2 = ? AND fr.user_id_1 = u.id)
          )
        WHERE fr.status = 'accepted'
          AND (
            ? = ''
            OR u.username LIKE ?
            OR u.display_name LIKE ?
          )
        ORDER BY u.username
        LIMIT ? OFFSET ?
      `;

      const searchTerm = `%${query}%`;
      const [friends] = await db.execute(searchQuery, [
        currentUserId,
        currentUserId,
        query,
        searchTerm,
        searchTerm,
        parseInt(limit),
        parseInt(offset),
      ]);

      res.status(200).json({
        success: true,
        data: {
          friends,
          query: query,
          hasMore: friends.length === parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Search friends error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search friends",
      });
    }
  },

  // Gợi ý bạn bè để follow (kết hợp friend suggestions)
  async getFollowSuggestions(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { limit = 20 } = req.query;

      // Lấy friend suggestions từ FriendModel
      const suggestions = await FriendModel.getSuggestedFriends(
        currentUserId,
        parseInt(limit)
      );

      // Lấy thông tin chi tiết của suggested users
      if (suggestions.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            suggestions: [],
          },
        });
      }

      const userIds = suggestions.map((s) => s.suggested_user_id);
      const placeholders = userIds.map(() => "?").join(",");

      const userQuery = `
        SELECT 
          id,
          username,
          display_name as displayName,
          avatar,
          bio
        FROM users
        WHERE id IN (${placeholders})
      `;

      const [users] = await db.execute(userQuery, userIds);

      // Kết hợp thông tin mutual count
      const suggestionsWithDetails = users.map((user) => {
        const suggestion = suggestions.find(
          (s) => s.suggested_user_id === user.id
        );
        return {
          ...user,
          mutualFriendsCount: suggestion.mutual_count,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          suggestions: suggestionsWithDetails,
        },
      });
    } catch (error) {
      console.error("Get follow suggestions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get suggestions",
      });
    }
  },
};

export default SearchController;
