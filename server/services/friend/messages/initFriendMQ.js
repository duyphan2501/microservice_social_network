import {
  subscribeDirect,
  sendQueue,
  consumeQueue,
} from "../../../gateway/messages/rabbitMQ.js";
import FriendModel from "../models/friend.model.js";

const initFriendMQ = async () => {
  try {
    await consumeQueue("send_get_friend_list", async (msg) => {
      const data = JSON.parse(msg);

      const limit = 9999;

      const friendList = await FriendModel.getFriendsList(data, limit);

      sendQueue(
        "get_friend_list",
        JSON.stringify({ friendList, userId: data })
      );
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ in Gateway:", error);
    setTimeout(initFriendMQ, 5000);
  }
};

export default initFriendMQ;
