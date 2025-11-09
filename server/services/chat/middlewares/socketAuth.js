import { filterFieldUser } from "../../users/helpers/filterField.js";
import { verifyAccessToken } from "../../users/helpers/jwt.helper.js";
import UserModel from "../../users/models/UserModel.js";

const socketAuth = async (socket, next) => {
  try {
    // 1. Lấy token từ handshake.auth (đề xuất)
    const token = socket.handshake.auth.token;

    // Hoặc nếu bạn vẫn muốn lấy từ cookie (ít tin cậy hơn):
    // const cookieString = socket.handshake.headers.cookie;
    // const token = cookieString
    //   ?.split("; ")
    //   .find((row) => row.startsWith("accessToken")) // Sửa lỗi chính tả
    //   ?.split("=")[1];


    if (!token) {
        console.error("Socket Auth: No token provided");
        return next(new Error("No token provide"));
    }

    const payload = await verifyAccessToken(token);
    const userId = payload.userId;

    if (!userId) {
        console.error("Socket Auth: Invalid token payload");
        return next(new Error("Socket connection rejected: Invalid token"));
    }
    socket.userId = userId;
    next(); 

  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(error);
  }
};

export default socketAuth;
