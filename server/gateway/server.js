import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(morgan("tiny"));

const PORT = process.env.GATEWAY_PORT || 3000;
const USER_TARGET = process.env.USER_TARGET || "http://localhost:3001";
const CHAT_TARGET = process.env.CHAT_TARGET || "http://localhost:3002";
const FRIEND_TARGET = process.env.FRIEND_TARGET || "http://localhost:3003";

app.get("/health", (_, res) => res.json({ ok: true, service: "gateway" }));

app.use(
  "/api/v1/user",
  createProxyMiddleware({
    target: USER_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/user": "" },
  })
);
app.use(
  "/api/v1/chat",
  createProxyMiddleware({
    target: CHAT_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/chat": "" },
  })
);
app.use(
  "/api/v1/friend",
  createProxyMiddleware({
    target: FRIEND_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/friend": "" },
  })
);

app.listen(PORT, () => console.log(`API Gateway on ${PORT}`));
