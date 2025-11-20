import { sendQueue, consumeQueue } from "../../../gateway/messages/rabbitMQ.js";

const friendListService = (() => {
  let isConsuming = false;
  const pendingRequests = new Map();

  const initConsumer = async () => {
    if (isConsuming) return;

    isConsuming = true;
    await consumeQueue("get_friend_list", async (msg) => {
      try {
        const response = JSON.parse(msg);
        // console.log("Received friend list:", response);

        if (response.userId && pendingRequests.has(response.userId)) {
          const callback = pendingRequests.get(response.userId);
          callback(response);
          pendingRequests.delete(response.userId);
        }
      } catch (error) {
        console.error("Error processing friend list:", error);
      }
    });
  };

  const getFriendList = async (userId, callback) => {
    await sendQueue("send_get_friend_list", JSON.stringify(userId));

    if (callback) {
      pendingRequests.set(userId, callback);

      setTimeout(() => {
        if (pendingRequests.has(userId)) {
          pendingRequests.delete(userId);
          console.warn(`Timeout waiting for friend list of user ${userId}`);
        }
      }, 30000);
    }
  };

  return { initConsumer, getFriendList };
})();

export default friendListService;
