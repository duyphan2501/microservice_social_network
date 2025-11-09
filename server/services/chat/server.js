
import morgan from "morgan";
import { checkConnection } from "./database/connectDB.js";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import ENV from "./helpers/env.helper.js";
import { app, server } from "./configs/socket.config.js";


app.use(morgan("dev"));
app.use(cookieParser());

app.get("/health", (_, res) => res.json({ success: true, service: "chat" }));

const PORT = ENV.PORT || 3002;

app.use(errorHandler);

server.listen(PORT, async () => {
  console.log(`Chat service on ${PORT}`);
  await checkConnection();
});
