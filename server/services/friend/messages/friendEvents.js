// messages/friendEvents.js
// Định nghĩa các event types và publish events cho Friend service

import { publishMessage } from "./rabbitMQ.js";

const EXCHANGES = {
  FRIEND_EVENTS: "friend_events",
  USER_EVENTS: "user_events",
  NOTIFICATION_EVENTS: "notification_events",
};

const FRIEND_EVENT_TYPES = {
  FRIEND_REQUEST_SENT: "friend_request_sent",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  FRIEND_REQUEST_DECLINED: "friend_request_declined",
  UNFRIENDED: "unfriended",
  USER_BLOCKED: "user_blocked",
  FRIEND_ADDED: "friend_added",
};

class FriendEventPublisher {
  // Publish friend request sent event
  static async publishFriendRequestSent(fromUserId, toUserId) {
    const event = {
      type: FRIEND_EVENT_TYPES.FRIEND_REQUEST_SENT,
      data: {
        fromUserId,
        toUserId,
        timestamp: new Date().toISOString(),
      },
    };

    await publishMessage(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));

    // Gửi notification event
    await this.publishNotificationEvent({
      userId: toUserId,
      type: "friend_request",
      title: "New friend request",
      message: `User ${fromUserId} sent you a friend request`,
      data: { fromUserId },
    });
  }

  // Publish friend request accepted event
  static async publishFriendRequestAccepted(userId, friendUserId) {
    const event = {
      type: FRIEND_EVENT_TYPES.FRIEND_REQUEST_ACCEPTED,
      data: {
        userId,
        friendUserId,
        timestamp: new Date().toISOString(),
      },
    };

    await publishMessage(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));

    // Notify người gửi request ban đầu
    await this.publishNotificationEvent({
      userId: friendUserId,
      type: "friend_request_accepted",
      title: "Friend request accepted",
      message: `User ${userId} accepted your friend request`,
      data: { userId },
    });
  }

  // Publish friend request declined event
  static async publishFriendRequestDeclined(userId, friendUserId) {
    const event = {
      type: FRIEND_EVENT_TYPES.FRIEND_REQUEST_DECLINED,
      data: {
        userId,
        friendUserId,
        timestamp: new Date().toISOString(),
      },
    };

    await publishMessage(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));
  }

  // Publish unfriended event
  static async publishUnfriended(userId, friendUserId) {
    const event = {
      type: FRIEND_EVENT_TYPES.UNFRIENDED,
      data: {
        userId,
        friendUserId,
        timestamp: new Date().toISOString(),
      },
    };

    await publishMessage(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));
  }

  // Publish user blocked event
  static async publishUserBlocked(userId, blockedUserId) {
    const event = {
      type: FRIEND_EVENT_TYPES.USER_BLOCKED,
      data: {
        userId,
        blockedUserId,
        timestamp: new Date().toISOString(),
      },
    };

    await publishMessage(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));
  }

  // Publish friend added event (sau khi accept)
  static async publishFriendAdded(userId1, userId2) {
    const event = {
      type: FRIEND_EVENT_TYPES.FRIEND_ADDED,
      data: {
        userId1,
        userId2,
        timestamp: new Date().toISOString(),
      },
    };

    await publishMessage(EXCHANGES.FRIEND_EVENTS, JSON.stringify(event));
  }

  // Helper: Publish notification event
  static async publishNotificationEvent(notification) {
    const event = {
      type: "create_notification",
      data: notification,
    };

    await publishMessage(EXCHANGES.NOTIFICATION_EVENTS, JSON.stringify(event));
  }
}

export { FriendEventPublisher, EXCHANGES, FRIEND_EVENT_TYPES };
