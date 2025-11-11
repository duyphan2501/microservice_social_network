import express from "express";
import http from "http";
import { Server } from "socket.io";
import ENV from "../helpers/env.helper.js";
import socketAuth from "../middlewares/socketAuth.js";
import { sendQueue } from "../messages/rabbitMQ.js";

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
    });
  } else {
    console.log("A client connected without a valid userId.");
    socket.disconnect(true); // Ngắt kết nối nếu không có userId hợp lệ
  }
});

export { io, server, app };
