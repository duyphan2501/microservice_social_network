// Gateway Service: gateway.service.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import ENV from "../helpers/env.helper.js";
import socketAuth from "../middlewares/socketAuth.js";
import { consumeQueue, sendQueue } from "../messages/rabbitMQ.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuth);

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.userId || "guest_user";

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("Socket connected user id =", userId, "Socket ID =", socket.id);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);
    });

    socket.on("disconnect", async () => {
      console.log(
        `User disconnected. Socket ID: ${socket.id}, User ID: ${userId}`
      );
      if (userSocketMap[userId]) {
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      await sendQueue(
        "user_last_active_updates",
        JSON.stringify({ userId: socket.userId, timestamp: Date.now() })
      );
      io.emit("user_last_active_updates", {
        userId: socket.userId,
        timestamp: Date.now(),
      });
    });
  } else {
    console.log("A client connected without a valid userId. Disconnecting.");
    socket.disconnect(true);
  }
});

async function connectRabbitMQ() {
  try {
    await consumeQueue("chat_events_to_client", (msg) => {
      if (msg) {
        const event = JSON.parse(msg);
        console.log(event);
        // Phân loại event và phát sóng (emit) tới đúng phòng/client
        switch (event.type) {
          case "NEW_MESSAGE_SAVED":
            // Phát tin nhắn đã lưu tới phòng chat
            io.to(event.data.conversation_id).emit(
              "receive_message",
              event.data
            );
            break;
          case "MESSAGE_STATUS_UPDATED":
            // Phát cập nhật trạng thái
            console.log("update to", event.data.conversationId);
            io.to(event.data.conversationId).emit("status_updated", event.data);
            break;
        }
      }
    });
    // ==================== FRIEND EVENTS ====================
    await consumeQueue("friend_events_to_client", (msg) => {
      if (msg) {
        const event = JSON.parse(msg);
        console.log("📨 [FRIEND]", event.type, event.data);

        const { targetUserId, ...eventData } = event.data;

        switch (event.type) {
          case "friend_request_received":
            // Emit to user nhận friend request
            emitToUser(targetUserId, "friend_request_received", {
              fromUserId: event.data.fromUserId,
              timestamp: event.data.timestamp,
            });
            break;

          case "friend_request_accepted":
            // Emit to user gửi request ban đầu
            emitToUser(targetUserId, "friend_request_accepted", {
              userId: event.data.userId,
              timestamp: event.data.timestamp,
            });
            break;

          case "unfriended":
            // Emit to user bị unfriend
            emitToUser(targetUserId, "unfriended", {
              userId: event.data.userId,
              timestamp: event.data.timestamp,
            });
            break;

          case "user_blocked":
            // Emit to user bị block
            emitToUser(targetUserId, "user_blocked", {
              userId: event.data.userId,
              timestamp: event.data.timestamp,
            });
            break;

          default:
            console.log("Unknown friend event type:", event.type);
        }
      }
    });

    // ==================== NOTIFICATION EVENTS ====================
    await consumeQueue("notification_events_to_client", (msg) => {
      if (msg) {
        const event = JSON.parse(msg);
        console.log("📨 [NOTIFICATION]", event.type);

        switch (event.type) {
          case "new_notification":
            emitToUser(event.data.userId, "new_notification", event.data);
            break;

          case "notification_read":
            emitToUser(event.data.userId, "notification_read", event.data);
            break;
        }
      }
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ in Gateway:", error);
    setTimeout(connectRabbitMQ, 5000); // Thử kết nối lại
  }
}

connectRabbitMQ();

export { io, server, app };
