// helpers/friend.socket.js
import FriendModel from "../models/friend.model.js";
import { FriendEventPublisher } from "../messages/friendEvents.js";
import userServiceMQ from "../messages/userService.js";

const setupFriendSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.userId;

    if (!userId) {
      console.error("Socket connected without userId");
      return;
    }

    // Join user's personal room
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected to friend service`);

    // Real-time friend request
    socket.on("send_friend_request", async (data) => {
      try {
        const { targetUserId } = data;

        if (!targetUserId) {
          return socket.emit("error", {
            message: "Target user ID is required",
          });
        }

        if (userId === targetUserId) {
          return socket.emit("error", {
            message: "Cannot send friend request to yourself",
          });
        }

        // Verify user exists
        const userExists = await userServiceMQ.verifyUserExists(targetUserId);
        if (!userExists) {
          return socket.emit("error", { message: "Target user not found" });
        }

        // Kiểm tra trạng thái
        const existingRelation = await FriendModel.getFriendshipStatus(
          userId,
          targetUserId
        );

        if (existingRelation) {
          if (existingRelation.status === "accepted") {
            return socket.emit("error", { message: "Already friends" });
          }
          if (existingRelation.status === "pending") {
            return socket.emit("error", {
              message: "Friend request already sent",
            });
          }
          if (existingRelation.status === "blocked") {
            return socket.emit("error", {
              message: "Cannot send friend request",
            });
          }
        }

        await FriendModel.sendFriendRequest(userId, targetUserId);

        // Publish event qua RabbitMQ
        await FriendEventPublisher.publishFriendRequestSent(
          userId,
          targetUserId
        );

        // Thông báo real-time cho người nhận
        io.to(`user_${targetUserId}`).emit("friend_request_received", {
          fromUserId: userId,
          timestamp: new Date(),
        });

        // Xác nhận cho người gửi
        socket.emit("friend_request_sent", {
          toUserId: targetUserId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Send friend request error:", error);
        socket.emit("error", { message: "Failed to send friend request" });
      }
    });

    // Accept friend request
    socket.on("accept_friend_request", async (data) => {
      try {
        const { fromUserId } = data;

        if (!fromUserId) {
          return socket.emit("error", { message: "From user ID is required" });
        }

        const relation = await FriendModel.getFriendshipStatus(
          userId,
          fromUserId
        );

        if (!relation || relation.status !== "pending") {
          return socket.emit("error", {
            message: "No pending friend request found",
          });
        }

        if (relation.action_user_id === userId) {
          return socket.emit("error", {
            message: "Cannot accept your own friend request",
          });
        }

        await FriendModel.acceptFriendRequest(userId, fromUserId);

        // Publish events qua RabbitMQ
        await FriendEventPublisher.publishFriendRequestAccepted(
          userId,
          fromUserId
        );
        await FriendEventPublisher.publishFriendAdded(userId, fromUserId);

        // Thông báo real-time cho cả 2 users
        io.to(`user_${fromUserId}`).emit("friend_request_accepted", {
          userId: userId,
          timestamp: new Date(),
        });

        socket.emit("friend_added", {
          friendUserId: fromUserId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Accept friend request error:", error);
        socket.emit("error", { message: "Failed to accept friend request" });
      }
    });

    // Decline friend request
    socket.on("decline_friend_request", async (data) => {
      try {
        const { fromUserId } = data;

        if (!fromUserId) {
          return socket.emit("error", { message: "From user ID is required" });
        }

        const relation = await FriendModel.getFriendshipStatus(
          userId,
          fromUserId
        );

        if (!relation || relation.status !== "pending") {
          return socket.emit("error", {
            message: "No pending friend request found",
          });
        }

        await FriendModel.declineFriendRequest(userId, fromUserId);

        // Publish event
        await FriendEventPublisher.publishFriendRequestDeclined(
          userId,
          fromUserId
        );

        // Thông báo (optional)
        io.to(`user_${fromUserId}`).emit("friend_request_declined", {
          userId: userId,
          timestamp: new Date(),
        });

        socket.emit("friend_request_declined_success", {
          fromUserId: fromUserId,
        });
      } catch (error) {
        console.error("Decline friend request error:", error);
        socket.emit("error", { message: "Failed to decline friend request" });
      }
    });

    // Unfriend
    socket.on("unfriend", async (data) => {
      try {
        const { friendUserId } = data;

        if (!friendUserId) {
          return socket.emit("error", {
            message: "Friend user ID is required",
          });
        }

        const result = await FriendModel.unfriend(userId, friendUserId);

        if (result.affectedRows === 0) {
          return socket.emit("error", {
            message: "Not friends or already unfriended",
          });
        }

        // Publish event
        await FriendEventPublisher.publishUnfriended(userId, friendUserId);

        // Thông báo real-time cho cả 2 users
        io.to(`user_${friendUserId}`).emit("unfriended", {
          userId: userId,
          timestamp: new Date(),
        });

        socket.emit("unfriend_success", {
          friendUserId: friendUserId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Unfriend error:", error);
        socket.emit("error", { message: "Failed to unfriend" });
      }
    });

    // Get online friends status
    socket.on("get_friends_online_status", async () => {
      try {
        const friends = await FriendModel.getFriendsList(userId, 1000, 0);
        const friendIds = friends.map((f) => f.friend_id);

        // Kiểm tra xem friend nào đang online
        const onlineFriends = [];
        for (const friendId of friendIds) {
          const sockets = await io.in(`user_${friendId}`).fetchSockets();
          if (sockets.length > 0) {
            onlineFriends.push(friendId);
          }
        }

        socket.emit("friends_online_status", {
          onlineFriends,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get friends online status error:", error);
        socket.emit("error", {
          message: "Failed to get friends online status",
        });
      }
    });

    // Typing indicators cho friend chat
    socket.on("typing_to_friend", (data) => {
      const { friendUserId } = data;
      if (friendUserId) {
        io.to(`user_${friendUserId}`).emit("friend_typing", {
          userId: userId,
          timestamp: new Date(),
        });
      }
    });

    socket.on("stop_typing_to_friend", (data) => {
      const { friendUserId } = data;
      if (friendUserId) {
        io.to(`user_${friendUserId}`).emit("friend_stop_typing", {
          userId: userId,
          timestamp: new Date(),
        });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${userId} disconnected from friend service`);

      // Notify friends về offline status (optional)
      try {
        const friends = await FriendModel.getFriendsList(userId, 1000, 0);
        friends.forEach((friend) => {
          io.to(`user_${friend.friend_id}`).emit("friend_offline", {
            userId: userId,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error("Error notifying friends on disconnect:", error);
      }
    });
  });
};

export default setupFriendSocket;
