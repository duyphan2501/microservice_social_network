import morgan from "morgan";
import { checkConnection } from "./database/connectDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import ENV from "./helpers/env.helper.js";
import postRouter from "./routes/post.route.js";
import express from "express";

const app = express();
app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ limit: "40mb", extended: true }));

app.use(morgan("dev"));
app.use(cookieParser());

app.get("/health", (_, res) => res.json({ success: true, service: "posts" }));

const PORT = ENV.PORT || 3004;

app.use("/", postRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Post service on ${PORT}`);
  await checkConnection();
});
