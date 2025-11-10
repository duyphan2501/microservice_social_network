import UserModel from "../models/UserModel.js";
import { consumeQueue } from "./rabbitMQ.js";
import { formatInTimeZone } from "date-fns-tz";

const startConsumer = async () => {
  try {
    await consumeQueue("user_last_active_updates", async (msg) => {
      const payload = JSON.parse(msg);
      const timeZone = "Asia/Ho_Chi_Minh";
      const formattedTimeVN = formatInTimeZone(
        new Date(payload.timestamp),
        timeZone,
        "yyyy-MM-dd HH:mm:ss"
      );
      const affectedRows = await UserModel.updateLastActive(
        payload.userId,
        formattedTimeVN
      );
      if (affectedRows === 0)
        throw new Error("Update last active failed, user id =", payload.userId);
    });
  } catch (error) {
    console.error(error);
  }
};

export { startConsumer };
