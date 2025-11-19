// messages/friendEvents.js
// Friend Service chỉ publish events qua RabbitMQ
// Gateway sẽ nhận và emit qua Socket.IO cho client

import { sendQueue, publishFanout } from "./rabbitMQ.js";

const EXCHANGES = {
  FRIEND_EVENTS: "friend_events",
  NOTIFICATION_EVENTS: "notification_events",
};

const QUEUES = {
  FRIEND_EVENTS_TO_CLIENT: "friend_events_to_client", // Queue cho Gateway
  NOTIFICATION_QUEUE: "notification_queue",
};

const FRIEND_EVENT_TYPES = {
  FRIEND_REQUEST_SENT: "friend_request_sent",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  FRIEND_REQUEST_DECLINED: "friend_request_declined",
  UNFRIENDED: "unfriended",
  USER_BLOCKED: "user_blocked",
  FRIEND_ADDED: "friend_added",
  FRIEND_REQUEST_RECEIVED: "friend_request_received",
};

class FriendEventPublisher {
  // Helper: Send event to Gateway (for Socket.IO emit)
  static async sendToGateway(eventType, data) {
    const event = {
      type: eventType,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    };

    // Send to Gateway queue để Gateway emit qua Socket.IO
    await sendQueue(QUEUES.FRIEND_EVENTS_TO_CLIENT, JSON.stringify(event));
    console.log(`📤 Sent to Gateway: ${eventType}`, data);
  }

  // Helper: Publish to exchange (for other services like Notification)
  static async publishToServices(eventType, data) {
    const event = {
      type: eventType,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    };

    // Publish to exchange cho các services khác subscribe
    await publishFanout(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));
    console.log(`📡 Published to services: ${eventType}`);
  }

  // Publish friend request sent
  static async publishFriendRequestSent(fromUserId, toUserId) {
    const data = { fromUserId, toUserId };

    // 1. Send to Gateway → emit cho client
    await this.sendToGateway(FRIEND_EVENT_TYPES.FRIEND_REQUEST_RECEIVED, {
      fromUserId,
      toUserId,
      targetUserId: toUserId, // User nhận notification
    });

    // 2. Publish cho Notification Service
    await this.publishToServices(FRIEND_EVENT_TYPES.FRIEND_REQUEST_SENT, data);

    // 3. Gửi notification event
    await this.publishNotificationEvent({
      userId: toUserId,
      type: "friend_request",
      title: "New friend request",
      message: `User ${fromUserId} sent you a friend request`,
      data: { fromUserId },
    });
  }

  // Publish friend request accepted
  static async publishFriendRequestAccepted(userId, friendUserId) {
    const data = { userId, friendUserId };

    // 1. Send to Gateway → emit cho người gửi request ban đầu
    await this.sendToGateway(FRIEND_EVENT_TYPES.FRIEND_REQUEST_ACCEPTED, {
      userId,
      friendUserId,
      targetUserId: friendUserId, // Người gửi request nhận notification
    });

    // 2. Publish cho các services khác
    await this.publishToServices(
      FRIEND_EVENT_TYPES.FRIEND_REQUEST_ACCEPTED,
      data
    );

    // 3. Gửi notification
    await this.publishNotificationEvent({
      userId: friendUserId,
      type: "friend_request_accepted",
      title: "Friend request accepted",
      message: `User ${userId} accepted your friend request`,
      data: { userId },
    });
  }

  // Publish friend request declined
  static async publishFriendRequestDeclined(userId, friendUserId) {
    const data = { userId, friendUserId };

    // Optional: có thể không notify người bị decline
    // Chỉ publish cho services tracking
    await this.publishToServices(
      FRIEND_EVENT_TYPES.FRIEND_REQUEST_DECLINED,
      data
    );
  }

  // Publish unfriended
  static async publishUnfriended(userId, friendUserId) {
    const data = { userId, friendUserId };

    // 1. Send to Gateway → emit cho người bị unfriend
    await this.sendToGateway(FRIEND_EVENT_TYPES.UNFRIENDED, {
      userId,
      friendUserId,
      targetUserId: friendUserId, // Người bị unfriend nhận notification
    });

    // 2. Publish cho các services khác
    await this.publishToServices(FRIEND_EVENT_TYPES.UNFRIENDED, data);
  }

  // Publish user blocked
  static async publishUserBlocked(userId, blockedUserId) {
    const data = { userId, blockedUserId };

    // 1. Send to Gateway
    await this.sendToGateway(FRIEND_EVENT_TYPES.USER_BLOCKED, {
      userId,
      blockedUserId,
      targetUserId: blockedUserId,
    });

    // 2. Publish cho các services khác
    await this.publishToServices(FRIEND_EVENT_TYPES.USER_BLOCKED, data);
  }

  // Publish friend added (sau khi accept)
  static async publishFriendAdded(userId1, userId2) {
    const data = { userId1, userId2 };

    // Chỉ publish cho services khác (User Service, Chat Service, etc.)
    // Không cần emit real-time cho client vì đã có friend_request_accepted
    await this.publishToServices(FRIEND_EVENT_TYPES.FRIEND_ADDED, data);
  }

  // Helper: Publish notification event
  static async publishNotificationEvent(notification) {
    const event = {
      type: "create_notification",
      data: notification,
    };

    // Send to Notification Service queue
    await sendQueue(QUEUES.NOTIFICATION_QUEUE, JSON.stringify(event));
  }
}

export { FriendEventPublisher, EXCHANGES, FRIEND_EVENT_TYPES, QUEUES };
