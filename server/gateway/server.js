import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors"
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const app = express();
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(morgan("tiny"));

const PORT = process.env.GATEWAY_PORT || 8000;
const USER_TARGET = process.env.USER_TARGET || "http://localhost:3001";

app.get("/health", (_, res) => res.json({ ok: true, service: "gateway" }));

app.use(
  "/api/v1/user",
  createProxyMiddleware({
    target: USER_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api/v1/user": "" },
  })
);

app.listen(PORT, () => console.log(`API Gateway on ${PORT}`));
