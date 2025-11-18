import { verifyAccessToken } from "../helpers/jwt.helper.js";

const socketAuth = async (socket, next) => {
  try {
    const cookieString = socket.handshake.headers.cookie;
    const token =
      socket.handshake.auth.token ||
      cookieString
        ?.split("; ")
        .find((row) => row.startsWith("accessToken"))
        ?.split("=")[1];

    if (token) {
      const payload = await verifyAccessToken(token);
      const userId = payload.userId;

      if (!userId) {
        console.error("Socket Auth: Invalid token payload");
        return next(new Error("Socket connection rejected: Invalid token"));
      }
      socket.userId = userId;
    } else {
      socket.userId = null;
    }

    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(error);
  }
};

export default socketAuth;
