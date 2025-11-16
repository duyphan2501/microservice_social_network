import morgan from "morgan";
import { checkConnection } from "./database/connectDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import ENV from "./helpers/env.helper.js";
import conversationRouter from "./routes/conversation.route.js";
import messageRouter from "./routes/message.route.js";
import express from "express"

const app = express()

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/health", (_, res) => res.json({ success: true, service: "chat" }));

const PORT = ENV.PORT || 3002;

app.use("/conversations", conversationRouter);
app.use("/messages", messageRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Chat service on ${PORT}`);
  await checkConnection();
});
