import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors"
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const app = express();
app.use(cors());
app.use(morgan("tiny"));

const PORT = process.env.GATEWAY_PORT || 8000;
const USERS_TARGET = process.env.USERS_URL || "http://localhost:8001";

app.get("/health", (_, res) => res.json({ ok: true, service: "gateway" }));

app.use(
  "/api/users",
  createProxyMiddleware({
    target: USERS_TARGET,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  })
);

app.listen(PORT, () => console.log(`API Gateway on ${PORT}`));
