// controllers/search.controller.js
import FriendModel from "../models/friend.model.js";
import userServiceMQ from "../messages/userService.js";

const SearchController = {
  // Tìm kiếm users qua User Service
  async searchUsers(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { query = "", limit = 20, offset = 0 } = req.query;

      // Tìm kiếm users qua User Service (RabbitMQ)
      const searchResult = await userServiceMQ.searchUsers(
        query,
        parseInt(limit),
        parseInt(offset)
      );

      const users = searchResult.users || [];

      if (users.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            users: [],
            query: query,
            total: 0,
            hasMore: false,
          },
        });
      }

      // Lấy friendship status cho mỗi user
      const usersWithFriendshipStatus = await Promise.all(
        users.map(async (user) => {
          const userIdToCheck = user.userId || user.id;

          if (!userIdToCheck) {
            return null;
          }

          if (userIdToCheck === currentUserId) {
            return null; // Skip current user
          }

          if (!currentUserId || !userIdToCheck) {
            return {
              ...user,
              id: userIdToCheck,
              friendshipStatus: "none",
              friendshipActionUserId: null,
              mutualFriendsCount: 0,
            };
          }

          const relation = await FriendModel.getFriendshipStatus(
            parseInt(currentUserId),
            parseInt(userIdToCheck)
          );

          // Tạm thời bỏ qua mutual friends để tránh lỗi
          const mutualFriendsCount = 0;

          return {
            ...user,
            id: userIdToCheck,
            friendshipStatus: relation
              ? relation.status === "pending" &&
                relation.action_user_id === currentUserId
                ? "request_sent"
                : relation.status === "pending"
                ? "request_received"
                : relation.status
              : "none",
            friendshipActionUserId: relation?.action_user_id,
            mutualFriendsCount,
          };
        })
      );

      // Filter out null values (current user)
      const filteredUsers = usersWithFriendshipStatus.filter(Boolean);

      res.status(200).json({
        success: true,
        data: {
          users: filteredUsers,
          query: query,
          total: searchResult.total || filteredUsers.length,
          hasMore: filteredUsers.length === parseInt(limit),
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

      // Lấy danh sách bạn bè
      const friends = await FriendModel.getFriendsList(currentUserId, 1000, 0);

      if (friends.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            friends: [],
            query: query,
            hasMore: false,
          },
        });
      }

      // Lấy thông tin user của tất cả friends
      const friendIds = friends.map((f) => f.friend_id);
      const friendUsers = await userServiceMQ.getUsersByIds(friendIds);

      // Filter theo query nếu có
      let filteredFriends = friendUsers;
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        filteredFriends = friendUsers.filter(
          (user) =>
            user.username?.toLowerCase().includes(lowerQuery) ||
            user.full_name?.toLowerCase().includes(lowerQuery) ||
            user.fullName?.toLowerCase().includes(lowerQuery) ||
            user.email?.toLowerCase().includes(lowerQuery)
        );
      }

      // Pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedFriends = filteredFriends.slice(startIndex, endIndex);

      // Add friendSince from relationship data
      const friendsWithDetails = paginatedFriends.map((user) => {
        const userId = user.userId || user.id;
        const friendRelation = friends.find((f) => f.friend_id === userId);
        return {
          ...user,
          id: userId,
          friendSince: friendRelation?.created_at,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          friends: friendsWithDetails,
          query: query,
          total: filteredFriends.length,
          hasMore: endIndex < filteredFriends.length,
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

  // Gợi ý bạn bè để follow
  async getFollowSuggestions(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { limit = 20 } = req.query;

      // Lấy friend suggestions từ FriendModel
      const suggestions = await FriendModel.getSuggestedFriends(
        currentUserId,
        parseInt(limit)
      );

      if (suggestions.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            suggestions: [],
          },
        });
      }

      // Lấy thông tin chi tiết của suggested users từ User Service
      const userIds = suggestions.map((s) => s.suggested_user_id);
      const users = await userServiceMQ.getUsersByIds(userIds);

      // Kết hợp thông tin mutual count
      const suggestionsWithDetails = users.map((user) => {
        const userId = user.userId || user.id;
        const suggestion = suggestions.find(
          (s) => s.suggested_user_id === userId
        );
        return {
          ...user,
          id: userId,
          mutualFriendsCount: suggestion?.mutual_count || 0,
          friendshipStatus: "none",
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
