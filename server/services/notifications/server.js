import morgan from "morgan";
import { checkConnection } from "./database/connectDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import ENV from "./helpers/env.helper.js";
import express from "express";
import initNotificationMQ from "./services/initNotificationMQ.js";
import notificationRouter from "./routes/notification.route.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use(morgan("dev"));
app.use(cookieParser());

app.get("/health", (_, res) =>
  res.json({ success: true, service: "notifications" })
);

//Init Message Queue
initNotificationMQ();

const PORT = ENV.PORT || 3005;

app.use("/", notificationRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Post service on ${PORT}`);
  await checkConnection();
});
