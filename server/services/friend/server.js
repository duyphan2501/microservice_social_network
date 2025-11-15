import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import ENV from "./helpers/env.helper.js";
import errorHandler from "./middlewares/errorHandler.js";
import { checkConnection } from "./database/connectDB.js";
import friendRouter from "./routes/friend.route.js";
import express from "express";

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_, res) => res.json({ success: true, service: "friend" }));

app.use("/friends", friendRouter);

app.use(errorHandler);

const PORT = ENV.PORT || 3003;

app.listen(PORT, async () => {
  console.log(`Friend service on ${PORT}`);
  await checkConnection();
});
