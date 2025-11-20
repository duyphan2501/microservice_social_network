import {
  subscribeDirect,
  sendQueue,
  consumeQueue,
  publishDirect,
} from "../../../gateway/messages/rabbitMQ.js";
import NotificationModel from "../models/notification.model.js";
import friendListService from "./friendlist.service.js";
import { getSenderInfo } from "./user.service.js";

const initNotificationMQ = async () => {
  try {
    // Khởi tạo consumer cho friend list một lần duy nhất
    await friendListService.initConsumer();

    // Subscribe vào post events
    await subscribeDirect(
      "post_events_pubsub",
      "post_friend_create",
      async (msg) => {
        try {
          const postData = JSON.parse(msg);

          // Sử dụng service để lấy friend list
          await friendListService.getFriendList(
            postData.user_id,
            async (data) => {
              const senderInfo = await getSenderInfo(postData.user_id);

              const notifications = data.friendList.map((d) => ({
                recipient_id: d.friend_id,
                sender_id: postData.user_id,
                sender_name: senderInfo.username,
                sender_avatar: senderInfo.avatar_url,
                type: "new_friend_post",
                entity_type: "post",
                entity_id: postData.id,
                content: "has posted a new post",
                media: postData?.media || [],
              }));

              const results = await Promise.all(
                notifications.map((n) => NotificationModel.addNotification(n))
              );

              publishDirect(
                "events_notificaiton",
                "new_unread_notification",
                JSON.stringify(notifications)
              );
            }
          );
        } catch (error) {
          console.error("Error processing post event:", error);
        }
      }
    );

    //Subscribe vào like
    await subscribeDirect(
      "post_events_pubsub",
      "post_friend_like",
      async (msg) => {
        try {
          const msgJSON = JSON.parse(msg);

          // Sử dụng service để lấy friend list
          const sender = msgJSON.sender;

          const postData = msgJSON.post;

          const senderInfo = await getSenderInfo(sender);

          const notification = {
            recipient_id: postData.user_id,
            sender_id: senderInfo.id,
            sender_name: senderInfo.username,
            sender_avatar: senderInfo.avatar_url,
            type: "post_like",
            entity_type: "post",
            entity_id: postData.id,
            content: "has liked your post",
            media: postData?.media || [],
          };

          const result = await NotificationModel.addNotification(notification);

          publishDirect(
            "events_notificaiton",
            "new_unread_notification",
            JSON.stringify(notification)
          );
        } catch (error) {
          console.error("Error processing post event:", error);
        }
      }
    );

    //Subscribe vào like
    await subscribeDirect(
      "post_events_pubsub",
      "post_friend_comment",
      async (msg) => {
        try {
          const msgJSON = JSON.parse(msg);

          // Sử dụng service để lấy friend list
          const sender = msgJSON.sender;

          const postData = msgJSON.post;

          const commentContent = msgJSON.content;

          const parentId = msgJSON.parentUserId || null;

          const senderInfo = await getSenderInfo(sender);

          let notification = {};

          if (parentId) {
            notification = {
              recipient_id: parentId,
              sender_id: senderInfo.id,
              sender_name: senderInfo.username,
              sender_avatar: senderInfo.avatar_url,
              type: "post_comment",
              entity_type: "comment",
              entity_id: postData.id,
              content: `has anwsered your comment: ${commentContent.slice(
                0,
                Math.min(commentContent.length, 20)
              )}${commentContent.length > 20 ? "..." : ""}`,
              media: postData?.media || [],
            };

            await NotificationModel.addNotification(notification);

            publishDirect(
              "events_notificaiton",
              "new_unread_notification",
              JSON.stringify(notification)
            );

            if (senderInfo.id !== postData.user_id) {
              console.log(
                `senderInfo: ${senderInfo.id}, postUser" ${postData.user_id}`
              );
              const notificationForHost = {
                recipient_id: postData.user_id,
                sender_id: senderInfo.id,
                sender_name: senderInfo.username,
                sender_avatar: senderInfo.avatar_url,
                type: "post_comment",
                entity_type: "comment",
                entity_id: postData.id,
                content: `has commented in your post: ${commentContent.slice(
                  0,
                  Math.min(commentContent.length, 20)
                )}${commentContent.length > 20 ? "..." : ""}`,
                media: postData?.media || [],
              };

              await NotificationModel.addNotification(notificationForHost);

              publishDirect(
                "events_notificaiton",
                "new_unread_notification",
                JSON.stringify(notificationForHost)
              );
            }
          } else {
            notification = {
              recipient_id: postData.user_id,
              sender_id: senderInfo.id,
              sender_name: senderInfo.username,
              sender_avatar: senderInfo.avatar_url,
              type: "post_comment",
              entity_type: "comment",
              entity_id: postData.id,
              content: `has commented in your post: ${commentContent.slice(
                0,
                Math.min(commentContent.length, 20)
              )}${commentContent.length > 20 ? "..." : ""}`,
              media: postData?.media || [],
            };

            await NotificationModel.addNotification(notification);

            publishDirect(
              "events_notificaiton",
              "new_unread_notification",
              JSON.stringify(notification)
            );
          }
        } catch (error) {
          console.error("Error processing post event:", error);
        }
      }
    );

    console.log("Notification MQ initialized successfully");
  } catch (error) {
    console.error("Error connecting to RabbitMQ in Gateway:", error);
    setTimeout(initNotificationMQ, 5000);
  }
};

export { initNotificationMQ, friendListService };
export default initNotificationMQ;
