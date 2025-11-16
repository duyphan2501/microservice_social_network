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
            console.log("update to", event.data.conversationId)
            io.to(event.data.conversationId).emit("status_updated", event.data);
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
