import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./database/connectDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import router from "./routes/user.route.js";
dotenv.config({ quite: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ success: true, service: "users" }));

const PORT = process.env.PORT || 3001;

app.use("/", router);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Users service on ${PORT}`);
  await connectDB();
});
