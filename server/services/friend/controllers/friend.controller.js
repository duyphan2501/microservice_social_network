// controllers/friend.controller.js
import FriendModel from "../models/friend.model.js";
import { FriendEventPublisher } from "../messages/friendEvents.js";
import userServiceMQ from "../messages/userService.js";
import { publishDirect } from "../../../gateway/messages/rabbitMQ.js";

const FriendController = {
  // Gửi lời mời kết bạn
  async sendFriendRequest(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { targetUserId, friendId } = req.body;
      const targetId = targetUserId || friendId;

      if (!targetId) {
        return res.status(400).json({
          success: false,
          message: "Target user ID is required",
        });
      }

      const currentUserIdInt = parseInt(currentUserId);
      const targetIdInt = parseInt(targetId);

      if (isNaN(currentUserIdInt) || isNaN(targetIdInt)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }

      if (currentUserIdInt === targetIdInt) {
        return res.status(400).json({
          success: false,
          message: "Cannot send friend request to yourself",
        });
      }

      // Verify target user exists via RabbitMQ
      const userExists = await userServiceMQ.verifyUserExists(targetIdInt);

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Target user not found",
        });
      }

      // Kiểm tra trạng thái hiện tại
      const existingRelation = await FriendModel.getFriendshipStatus(
        currentUserIdInt,
        targetIdInt
      );

      if (existingRelation) {
        if (existingRelation.status === "accepted") {
          return res.status(400).json({
            success: false,
            message: "Already friends",
          });
        }
        if (existingRelation.status === "pending") {
          return res.status(400).json({
            success: false,
            message: "Friend request already sent",
          });
        }
        if (existingRelation.status === "blocked") {
          return res.status(400).json({
            success: false,
            message: "Cannot send friend request",
          });
        }
      }

      await FriendModel.sendFriendRequest(currentUserIdInt, targetIdInt);

      const addFriendEventData = {
        sender_id: currentUserIdInt,
        recipient_id: targetIdInt,
      };

      publishDirect(
        "friend_request_pubsub",
        "add_friend_event",
        JSON.stringify(addFriendEventData)
      );

      // Publish event qua RabbitMQ
      await FriendEventPublisher.publishFriendRequestSent(
        currentUserIdInt,
        targetIdInt
      );

      res.status(200).json({
        success: true,
        message: "Friend request sent successfully",
      });
    } catch (error) {
      console.error("Send friend request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send friend request",
      });
    }
  },

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { fromUserId } = req.body;

      if (!fromUserId) {
        return res.status(400).json({
          success: false,
          message: "From user ID is required",
        });
      }

      // Kiểm tra xem có lời mời không
      const relation = await FriendModel.getFriendshipStatus(
        currentUserId,
        fromUserId
      );

      if (!relation || relation.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "No pending friend request found",
        });
      }

      if (relation.action_user_id === currentUserId) {
        return res.status(400).json({
          success: false,
          message: "Cannot accept your own friend request",
        });
      }

      const result = await FriendModel.acceptFriendRequest(
        currentUserId,
        fromUserId
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to accept friend request",
        });
      }

      // Publish events
      await FriendEventPublisher.publishFriendRequestAccepted(
        currentUserId,
        fromUserId
      );
      await FriendEventPublisher.publishFriendAdded(currentUserId, fromUserId);

      res.status(200).json({
        success: true,
        message: "Friend request accepted",
      });
    } catch (error) {
      console.error("Accept friend request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to accept friend request",
      });
    }
  },

  // Từ chối lời mời kết bạn
  async declineFriendRequest(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { fromUserId } = req.body;

      if (!fromUserId) {
        return res.status(400).json({
          success: false,
          message: "From user ID is required",
        });
      }

      const relation = await FriendModel.getFriendshipStatus(
        currentUserId,
        fromUserId
      );

      if (!relation || relation.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "No pending friend request found",
        });
      }

      if (relation.action_user_id === currentUserId) {
        return res.status(400).json({
          success: false,
          message: "Cannot decline your own friend request",
        });
      }

      await FriendModel.declineFriendRequest(currentUserId, fromUserId);

      // Publish event
      await FriendEventPublisher.publishFriendRequestDeclined(
        currentUserId,
        fromUserId
      );

      res.status(200).json({
        success: true,
        message: "Friend request declined",
      });
    } catch (error) {
      console.error("Decline friend request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to decline friend request",
      });
    }
  },

  // Huỷ kết bạn
  async unfriend(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { friendUserId } = req.body;

      if (!friendUserId) {
        return res.status(400).json({
          success: false,
          message: "Friend user ID is required",
        });
      }

      const result = await FriendModel.unfriend(currentUserId, friendUserId);

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: "Not friends or already unfriended",
        });
      }

      // Publish event
      await FriendEventPublisher.publishUnfriended(currentUserId, friendUserId);

      res.status(200).json({
        success: true,
        message: "Unfriended successfully",
      });
    } catch (error) {
      console.error("Unfriend error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unfriend",
      });
    }
  },

  // Lấy danh sách bạn bè với thông tin user
  async getFriendsList(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const friends = await FriendModel.getFriendsList(
        currentUserId,
        parseInt(limit),
        parseInt(offset)
      );

      // Enrich với user data từ User Service qua RabbitMQ
      const friendsWithUserData = await userServiceMQ.enrichWithUserData(
        friends,
        "friend_id"
      );

      const totalCount = await FriendModel.getFriendsCount(currentUserId);

      res.status(200).json({
        success: true,
        data: {
          friends: friendsWithUserData,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + friends.length < totalCount,
          },
        },
      });
    } catch (error) {
      console.error("Get friends list error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get friends list",
      });
    }
  },

  // Lấy danh sách lời mời kết bạn đã nhận
  async getReceivedFriendRequests(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const requests = await FriendModel.getReceivedFriendRequests(
        currentUserId,
        parseInt(limit),
        parseInt(offset)
      );

      // Enrich với user data
      const requestsWithUserData = await userServiceMQ.enrichWithUserData(
        requests,
        "from_user_id"
      );

      const totalCount = await FriendModel.getPendingRequestsCount(
        currentUserId
      );

      res.status(200).json({
        success: true,
        data: {
          requests: requestsWithUserData,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + requests.length < totalCount,
          },
        },
      });
    } catch (error) {
      console.error("Get received requests error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get friend requests",
      });
    }
  },

  // Lấy danh sách lời mời đã gửi
  async getSentFriendRequests(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const requests = await FriendModel.getSentFriendRequests(
        currentUserId,
        parseInt(limit),
        parseInt(offset)
      );

      // Enrich với user data
      const requestsWithUserData = await userServiceMQ.enrichWithUserData(
        requests,
        "to_user_id"
      );

      res.status(200).json({
        success: true,
        data: {
          requests: requestsWithUserData,
        },
      });
    } catch (error) {
      console.error("Get sent requests error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get sent requests",
      });
    }
  },

  // Gợi ý bạn bè
  async getSuggestedFriends(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { limit = 20 } = req.query;

      const suggestions = await FriendModel.getSuggestedFriends(
        currentUserId,
        parseInt(limit)
      );

      // Enrich với user data
      const suggestionsWithUserData = await userServiceMQ.enrichWithUserData(
        suggestions,
        "suggested_user_id"
      );

      res.status(200).json({
        success: true,
        data: {
          suggestions: suggestionsWithUserData,
        },
      });
    } catch (error) {
      console.error("Get suggested friends error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get friend suggestions",
      });
    }
  },

  // Kiểm tra trạng thái friendship
  async getFriendshipStatus(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { targetUserId } = req.params;

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: "Target user ID is required",
        });
      }

      const relation = await FriendModel.getFriendshipStatus(
        currentUserId,
        parseInt(targetUserId)
      );

      res.status(200).json({
        success: true,
        data: {
          status: relation ? relation.status : "none",
          isFriend: relation?.status === "accepted",
          isPending: relation?.status === "pending",
          actionUserId: relation?.action_user_id,
        },
      });
    } catch (error) {
      console.error("Get friendship status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get friendship status",
      });
    }
  },

  // Block user
  async blockUser(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: "Target user ID is required",
        });
      }

      await FriendModel.blockUser(currentUserId, targetUserId);

      // Publish event
      await FriendEventPublisher.publishUserBlocked(
        currentUserId,
        targetUserId
      );

      res.status(200).json({
        success: true,
        message: "User blocked successfully",
      });
    } catch (error) {
      console.error("Block user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to block user",
      });
    }
  },

  // Lấy mutual friends
  async getMutualFriends(req, res) {
    try {
      const currentUserId = req.user.userId;
      const { targetUserId } = req.params;
      const { limit = 50 } = req.query;

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: "Target user ID is required",
        });
      }

      const mutualFriends = await FriendModel.getMutualFriends(
        currentUserId,
        parseInt(targetUserId),
        parseInt(limit)
      );

      // Enrich với user data
      const mutualFriendsWithUserData = await userServiceMQ.enrichWithUserData(
        mutualFriends,
        "mutual_friend_id"
      );

      res.status(200).json({
        success: true,
        data: {
          mutualFriends: mutualFriendsWithUserData,
          count: mutualFriends.length,
        },
      });
    } catch (error) {
      console.error("Get mutual friends error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get mutual friends",
      });
    }
  },

  //Lấy số lượng bạn bè theo userId
  async getFriendQuantity(req, res) {
    try {
      const userId = req.params.userId;

      const count = await FriendModel.countFriends(userId);

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      throw error;
    }
  },
};

export default FriendController;
