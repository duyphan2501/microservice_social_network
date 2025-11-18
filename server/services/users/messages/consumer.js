import UserModel from "../models/UserModel.js";
import { consumeQueue } from "./rabbitMQ.js";
import { formatInTimeZone } from "date-fns-tz";
import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const startConsumer = async () => {
  try {
    // Consumer cũ - cập nhật last active
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
      console.log(
        `Updated last active user id = ${payload.userId}, timestamp = ${formattedTimeVN}`
      );
    });

    // Consumer mới - tìm kiếm users
    const conn = await amqp.connect(process.env.AMQP_URL_DOCKER);
    const channel = await conn.createChannel();

    const queueName = "user.search";
    await channel.assertQueue(queueName, { durable: true });

    await channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const properties = msg.properties;

          const { query, limit, offset } = JSON.parse(content);

          // Tìm kiếm users trong database
          const users = await UserModel.searchUsers(query, limit, offset);
          const total = await UserModel.countSearchResults(query);

          const response = {
            success: true,
            data: {
              users,
              total,
              hasMore: offset + users.length < total,
            },
          };

          // Reply về cho service gọi
          if (properties.replyTo && properties.correlationId) {
            channel.sendToQueue(
              properties.replyTo,
              Buffer.from(JSON.stringify(response)),
              {
                correlationId: properties.correlationId,
                persistent: true,
              }
            );
          }

          channel.ack(msg);
        } catch (error) {
          console.error("Error processing search:", error);

          if (msg.properties.replyTo && msg.properties.correlationId) {
            const errorResponse = {
              success: false,
              data: { users: [], total: 0 },
              error: error.message,
            };

            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(errorResponse)),
              {
                correlationId: msg.properties.correlationId,
                persistent: true,
              }
            );
          }

          channel.ack(msg);
        }
      }
    });

    console.log("All consumers started successfully");
  } catch (error) {
    console.error("Consumer startup error:", error);
  }
};

export { startConsumer };
