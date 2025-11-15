// messages/userService.js
// Giao tiếp với User Service qua RabbitMQ

import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const TIMEOUT = 5000; // 5 seconds timeout

class UserServiceMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.replyQueue = null;
    this.pendingRequests = new Map();
  }

  async connect() {
    if (this.channel) return;

    try {
      this.connection = await amqp.connect(process.env.AMQP_URL_DOCKER);
      this.channel = await this.connection.createChannel();

      // Tạo reply queue để nhận response
      const { queue } = await this.channel.assertQueue("", { exclusive: true });
      this.replyQueue = queue;

      // Consume reply queue
      await this.channel.consume(
        this.replyQueue,
        (msg) => {
          if (msg) {
            const correlationId = msg.properties.correlationId;
            const resolver = this.pendingRequests.get(correlationId);

            if (resolver) {
              const response = JSON.parse(msg.content.toString());
              resolver(response);
              this.pendingRequests.delete(correlationId);
            }

            this.channel.ack(msg);
          }
        },
        { noAck: false }
      );

      console.log("✅ Connected to User Service via RabbitMQ");
    } catch (error) {
      console.error("❌ Failed to connect User Service MQ:", error);
    }
  }

  async sendRequest(queueName, data, timeout = TIMEOUT) {
    if (!this.channel) {
      await this.connect();
    }

    const correlationId = uuidv4();

    return new Promise((resolve, reject) => {
      // Set timeout
      const timer = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(new Error(`Request timeout for ${queueName}`));
      }, timeout);

      // Store resolver
      this.pendingRequests.set(correlationId, (response) => {
        clearTimeout(timer);
        resolve(response);
      });

      // Send request
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
        correlationId,
        replyTo: this.replyQueue,
        persistent: true,
      });
    });
  }

  // Lấy thông tin user theo ID
  async getUserById(userId) {
    try {
      const response = await this.sendRequest("user.get_by_id", { userId });
      return response.success ? response.data : null;
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error.message);
      return null;
    }
  }

  // Lấy thông tin nhiều users
  async getUsersByIds(userIds) {
    try {
      const response = await this.sendRequest("user.get_by_ids", { userIds });
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Error getting users:", error.message);
      return [];
    }
  }

  // Tìm kiếm users
  async searchUsers(query, limit = 20, offset = 0) {
    try {
      const response = await this.sendRequest("user.search", {
        query,
        limit,
        offset,
      });
      return response.success ? response.data : { users: [], total: 0 };
    } catch (error) {
      console.error("Error searching users:", error.message);
      return { users: [], total: 0 };
    }
  }

  // Verify user exists
  async verifyUserExists(userId) {
    try {
      const response = await this.sendRequest("user.verify_exists", {
        userId,
      });
      return response.success && response.exists === true;
    } catch (error) {
      console.error(`Error verifying user ${userId}:`, error.message);
      return false;
    }
  }

  // Enrich data với user information
  async enrichWithUserData(items, userIdField = "friend_id") {
    if (!items || items.length === 0) return [];

    const userIds = [...new Set(items.map((item) => item[userIdField]))].filter(
      Boolean
    );
    if (userIds.length === 0) return items;

    const users = await this.getUsersByIds(userIds);
    const userMap = new Map(users.map((user) => [user.id, user]));

    return items.map((item) => ({
      ...item,
      user: userMap.get(item[userIdField]) || null,
    }));
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

// Export singleton instance
const userServiceMQ = new UserServiceMQ();
export default userServiceMQ;
