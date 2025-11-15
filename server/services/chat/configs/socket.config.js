import express from "express";
import http from "http";
import { Server } from "socket.io";
import ENV from "../helpers/env.helper.js";
import socketAuth from "../middlewares/socketAuth.js";
import { sendQueue } from "../messages/rabbitMQ.js";
import MessageModel from "../models/message.model.js";

const app = express();
app.use(express.json());
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
  if (socket.userId) {
    userSocketMap[socket.userId] = socket.id;
    console.log(
      "Socket connected user id =",
      socket.userId,
      "Socket ID =",
      socket.id
    );

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // SỰ KIỆN 1: THAM GIA PHÒNG CHAT
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined room ${conversationId}`);
    });

    // SỰ KIỆN 2: GỬI TIN NHẮN MỚI
    socket.on("send_message", async (messageData) => {
      // messageData: { conversationId, senderId, content, type, media, tempId }

      try {
        // Sử dụng hàm DAO để lưu vào DB (Cần import messageDAO)
        const messageId = await MessageModel.saveNewMessage(messageData);

        const savedMessage = await MessageModel.getMessageById(messageId);

        // Phát tin nhắn ĐÃ LƯU trở lại cho TẤT CẢ client trong phòng chat đó
        io.to(messageData.conversationId).emit("receive_message", {
          ...savedMessage,
          tempId: messageData.tempId,
        });
      } catch (error) {
        console.error("Error handling send_message:", error);
        // Có thể emit một sự kiện lỗi về client nếu cần
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    // SỰ KIỆN 3: CẬP NHẬT TRẠNG THÁI (DELIVERED / READ)
    socket.on("update_message_status", async (data) => {
      const { conversationId, messageId, userId, status } = data;

      try {
        await MessageModel.markMessageStatus(messageId, userId, status);
        // Thông báo cho TẤT CẢ client biết trạng thái đã thay đổi
        io.to(conversationId).emit("status_updated", {
          messageId,
          status,
        });
      } catch (error) {
        console.error("Error handling update_message_status:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(
        `User disconnected. Socket ID: ${socket.id}, User ID: ${socket.userId}`
      );
      if (userSocketMap[socket.userId]) {
        delete userSocketMap[socket.userId];
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
    console.log("A client connected without a valid userId.");
    socket.disconnect(true); // Ngắt kết nối nếu không có userId hợp lệ
  }
});

export { io, server, app };
