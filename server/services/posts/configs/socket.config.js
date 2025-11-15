import express from "express";
import http from "http";
import { Server } from "socket.io";
import ENV from "../helpers/env.helper.js";
import socketAuth from "../middlewares/socketAuth.js";
import PostModel from "../models/post.model.js"; 

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

io.on("connection", (socket) => {
  if (socket.userId) {
    console.log(
      "Post Service: Socket connected user id =",
      socket.userId,
      "Socket ID =",
      socket.id
    );

    socket.on("join_post_room", (postId) => {
      socket.join(`post_${postId}`);
      console.log(`User ${socket.userId} joined room post_${postId}`);
    });
    
    socket.on("leave_post_room", (postId) => {
        socket.leave(`post_${postId}`);
        console.log(`User ${socket.userId} left room post_${postId}`);
    });

    socket.on("disconnect", () => {
      console.log(
        `Post Service: User disconnected. Socket ID: ${socket.id}, User ID: ${socket.userId}`
      );
    });

  } else {
    console.log("Post Service: A client connected without a valid userId.");
    socket.disconnect(true); 
  }
});


export {io, server, app}