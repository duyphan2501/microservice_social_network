import { sendQueue, publishFanout, publishDirect } from "./rabbitMQ.js";

export class FriendEventPublisher {
  // Publish đến Gateway qua queue trực tiếp
  static async publishToGateway(eventType, data) {
    try {
      const event = {
        type: eventType,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      };

      await sendQueue("friend_events_to_gateway", JSON.stringify(event));
      console.log("📤 Sent to Gateway:", eventType, data);
    } catch (error) {
      console.error("Error publishing to gateway:", error);
    }
  }

  // Publish đến Client Service qua queue trực tiếp
  static async publishToClient(eventType, data) {
    try {
      const event = {
        type: eventType,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      };

      await sendQueue("friend_events_to_client", JSON.stringify(event));
      console.log("📤 Sent to Client:", eventType, data);
    } catch (error) {
      console.error("Error publishing to client:", error);
    }
  }

  // Publish đến tất cả services qua fanout exchange
  static async publishToServices(eventType, data) {
    try {
      const event = {
        type: eventType,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      };

      await publishFanout("friend_events", JSON.stringify(event));
      console.log("📤 Published to all services:", eventType, data);
    } catch (error) {
      console.error("Error publishing to services:", error);
    }
  }

  // Friend request sent
  static async publishFriendRequestSent(fromUserId, toUserId) {
    await this.publishToClient("friend_request_received", {
      fromUserId,
      toUserId,
      targetUserId: toUserId,
    });

    await this.publishToServices("friend_request_sent", {
      fromUserId,
      toUserId,
    });
  }

  // Friend request accepted
  static async publishFriendRequestAccepted(acceptorUserId, requesterUserId) {
    await this.publishToClient("friend_request_accepted", {
      acceptorUserId,
      requesterUserId,
    });

    await this.publishToServices("friend_request_accepted", {
      user1Id: acceptorUserId,
      user2Id: requesterUserId,
    });
  }

  // Friend request declined
  static async publishFriendRequestDeclined(declinerUserId, requesterUserId) {
    await this.publishToClient("friend_request_declined", {
      declinerUserId,
      requesterUserId,
    });

    await this.publishToServices("friend_request_declined", {
      declinerUserId,
      requesterUserId,
    });
  }

  // Friend added (after acceptance)
  static async publishFriendAdded(user1Id, user2Id) {
    await this.publishToClient("friend_added", {
      user1Id,
      user2Id,
    });

    await this.publishToServices("friend_added", {
      user1Id,
      user2Id,
    });
  }

  // Unfriended
  static async publishUnfriended(unfrienderUserId, unfriendedUserId) {
    await this.publishToClient("unfriended", {
      unfrienderUserId,
      unfriendedUserId,
    });

    await this.publishToServices("unfriended", {
      user1Id: unfrienderUserId,
      user2Id: unfriendedUserId,
    });
  }

  // User blocked
  static async publishUserBlocked(blockerUserId, blockedUserId) {
    await this.publishToClient("user_blocked", {
      blockerUserId,
      blockedUserId,
    });

    await this.publishToServices("user_blocked", {
      blockerUserId,
      blockedUserId,
    });
  }

  // Friend status changed (generic event)
  static async publishFriendStatusChanged(user1Id, user2Id, status) {
    await this.publishToServices("friend_status_changed", {
      user1Id,
      user2Id,
      status,
    });
  }
}
