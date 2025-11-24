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

    // Kết nối RabbitMQ cho các consumer mới
    const conn = await amqp.connect(process.env.AMQP_URL_DOCKER);
    const channel = await conn.createChannel();

    // Consumer - tìm kiếm users
    await channel.assertQueue("user.search", { durable: true });
    console.log(`👂 Consume on queue "user.search"`);

    await channel.consume("user.search", async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const properties = msg.properties;

          const { query, limit, offset } = JSON.parse(content);

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

    // Consumer - verify user exists
    await channel.assertQueue("user.verify_exists", { durable: true });
    console.log(` Consume on queue "user.verify_exists"`);

    await channel.consume("user.verify_exists", async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const properties = msg.properties;

          const { userId } = JSON.parse(content);

          const user = await UserModel.getUserById(userId);
          const exists = user !== null;

          console.log(` User ${userId} exists: ${exists}`);

          const response = {
            success: true,
            exists: exists,
            userId: userId,
          };

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
          console.error("Error processing verify_exists:", error);

          if (msg.properties.replyTo && msg.properties.correlationId) {
            const errorResponse = {
              success: false,
              exists: false,
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

    await channel.assertQueue("user.get_by_id", { durable: true });
    console.log(`👂 Consume on queue "user.get_by_id"`);

    await channel.consume("user.get_by_id", async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const properties = msg.properties;

          const { userId } = JSON.parse(content);

          const user = await UserModel.getUserById(userId);

          const response = {
            success: true,
            data: user
              ? {
                  id: user.id,
                  userId: user.id,
                  username: user.username,
                  full_name: user.full_name,
                  fullName: user.full_name,
                  email: user.email,
                  avatar_url: user.avatar_url,
                  avatarUrl: user.avatar_url,
                  last_active_at: user.last_active_at,
                  lastActive: user.last_active_at,
                }
              : null,
          };

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
          console.error("Error processing get_by_id:", error);

          if (msg.properties.replyTo && msg.properties.correlationId) {
            const errorResponse = {
              success: false,
              data: null,
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

    await channel.assertQueue("user.get_by_ids", { durable: true });
    console.log(`👂 Consume on queue "user.get_by_ids"`);

    await channel.consume("user.get_by_ids", async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const properties = msg.properties;

          const { userIds } = JSON.parse(content);

          console.log(`Getting users by IDs:`, userIds);

          // Lấy thông tin nhiều users
          const users = await Promise.all(
            userIds.map(async (userId) => {
              const user = await UserModel.getUserById(userId);
              if (!user) return null;

              return {
                id: user.id,
                userId: user.id,
                username: user.username,
                full_name: user.full_name,
                fullName: user.full_name,
                email: user.email,
                avatar_url: user.avatar_url,
                avatarUrl: user.avatar_url,
                last_active_at: user.last_active_at,
                lastActive: user.last_active_at,
              };
            })
          );

          // Filter out null values
          const validUsers = users.filter(Boolean);

          console.log(` Found ${validUsers.length} users`);

          const response = {
            success: true,
            data: validUsers,
          };

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
          console.error("Error processing get_by_ids:", error);

          if (msg.properties.replyTo && msg.properties.correlationId) {
            const errorResponse = {
              success: false,
              data: [],
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
