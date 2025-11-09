import express from "express";
import http from "http";
import { Server } from "socket.io";
import ENV from "../helpers/env.helper.js";
import socketAuth from "../middlewares/socketAuth.js";

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
  userSocketMap[socket.userId] = socket.id;
  console.log("Socket connected user id =", socket.userId);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  io.on("disconnection", () => {
    delete userSocketMap[socket.userId];
    console.log("User connected", socket.user.username);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export {io, server, app}
