// Gateway Service: gateway.service.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import ENV from "../helpers/env.helper.js";
import socketAuth from "../middlewares/socketAuth.js";
import {
  consumeQueue,
  sendQueue,
  subscribeDirect,
} from "../messages/rabbitMQ.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: ENV.CLIENT_URL,
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.use(socketAuth);

const userSocketMap = {};

io.on("connection", (socket) => {
  // socket.userId sẽ là userId thật (string) hoặc null (nếu là khách)
  const userId = socket.userId;

  console.log(
    `Socket connected. User ID: ${userId ? userId : "Guest"}, Socket ID: ${
      socket.id
    }`
  );

  // --- Xử lý cho người dùng ĐÃ ĐĂNG NHẬP ---
  if (userId) {
    userSocketMap[userId] = socket.id;

    //Cấp một room riêng thep userid
    socket.join(`user_${userId}`);
    console.log(`User ${userId} has joined his own room`);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.id} left room ${conversationId}`);
    });
  }

  // --- Logic CHUNG cho cả KHÁCH và USER ĐĂNG NHẬP (VD: Public Post Updates) ---

  socket.on("join_postRoom", (postId) => {
    // Cả khách và user đều có thể join room này để nhận realtime like/comment
    console.log(
      `User ${userId ? userId : "Guest"} joining room post_${postId}`
    );
    socket.join(`post_${postId}`);
  });

  socket.on("leave_postRoom", (postId) => {
    console.log(`User ${socket.id} leaving room post_${postId}`);
    socket.leave(`post_${postId}`);
  });

  // --- Xử lý sự kiện ngắt kết nối (Disconnect) ---
  socket.on("disconnect", async () => {
    console.log(
      `User disconnected. Socket ID: ${socket.id}, User ID: ${
        userId ? userId : "Guest"
      }`
    );

    // Chỉ xử lý logic offline cho người dùng ĐÃ ĐĂNG NHẬP
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      // Cập nhật trạng thái hoạt động lần cuối (chỉ cho user đăng nhập)
      await sendQueue(
        "user_last_active_updates",
        JSON.stringify({ userId: userId, timestamp: Date.now() })
      );
      io.emit("user_last_active_updates", {
        userId: userId,
        timestamp: Date.now(),
      });
    }
  });
});

async function connectRabbitMQ() {
  try {
    await consumeQueue("chat_events_to_client", (msg) => {
      if (msg) {
        const event = JSON.parse(msg);
        // Phân loại event và phát sóng (emit) tới đúng phòng/client
        switch (event.type) {
          case "NEW_MESSAGE_SAVED":
            // Phát tin nhắn đã lưu tới phòng chat
            io.to(event.data.conversation_id).emit(
              "receive_message",
              event.data
            );

            io.to(`user_${event.data.receiverId}`).emit(
              "chat_notification",
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

    await subscribeDirect(
      "post_events_pubsub",
      "post_like_updated",
      async (msg) => {
        const data = JSON.parse(msg);
        console.log("update data", data);
        io.to(`post_${data.postId}`).emit("update_post_likes", data);
      }
    );

    await subscribeDirect(
      "post_events_pubsub",
      "post_comment_created",
      async (msg) => {
        const data = JSON.parse(msg);
        io.to(`post_${data.postId}`).emit("receive_new_comment", data.comment);
      }
    );
  } catch (error) {
    console.error("Error connecting to RabbitMQ in Gateway:", error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

connectRabbitMQ();

export { io, server, app };
