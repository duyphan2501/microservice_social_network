import { verifyAccessToken } from "../helpers/jwt.helper.js";

const socketAuth = async (socket, next) => {
  try {
    const cookieString = socket.handshake.headers.cookie;

    let token =
      socket.handshake.auth.token ||
      cookieString
        ?.split("; ")
        .find((row) => row.startsWith("accessToken"))
        ?.split("=")[1];

    if (!token) {
      socket.userId = null; 
      return next();
    }

    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch (err) {
      if (err.message === "jwt expired") {
        return next(new Error("TOKEN_EXPIRED"));
      }
      return next(new Error("INVALID_TOKEN"));
    }

    socket.userId = payload.userId;
    next();
  } catch (error) {
    console.log("SocketAuthError:", error);
    next(new Error("AUTH_ERROR"));
  }
};

export default socketAuth;
