import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";
import { safeToastError } from "../utils/toastLimiter";

const groupByDate = (items) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay()); // Chủ nhật đầu tuần
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = {
    new: [],
    today: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  items.forEach((item) => {
    const createdAt = new Date(item.created_at);

    if (!item.is_read) {
      grouped.new.push(item);
    } else if (createdAt >= todayStart) {
      grouped.today.push(item);
    } else if (createdAt >= weekStart) {
      grouped.thisWeek.push(item);
    } else if (createdAt >= monthStart) {
      grouped.thisMonth.push(item);
    } else {
      grouped.older.push(item);
    }
  });

  return grouped;
};
const handle504 = () => {
  console.log("504 Gateway Timeout");
  safeToastError("The system notification is under maintenance. Please try again later.");
};

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  getNotifications: async (userId) => {
    try {
      set({
        loading: true,
      });
      const res = await API.get(`/notifications/${userId}`);

      set({
        notifications: groupByDate(res.data?.notifications),
      });

      return res.data.notifications;
    } catch (error) {
      console.error(error);
      if (error.response.status === 504) handle504();
    } finally {
      set({
        loading: false,
      });
    }
  },

  viewNotifications: async (userId) => {
    try {
      const res = await API.put(`/notifications/read-notification/${userId}`);

      return res.data.success;
    } catch (error) {
      console.error(error);
    }
  },

  responseFriendRequest: async (fromUserId, notificationId, type) => {
    try {
      if (!["accept", "decline"].includes(type)) return false;

      if (type === "accept") {
        const resFriendAccept = await API.post("/friends/accept", {
          fromUserId,
        });

        if (!resFriendAccept.data.success) return false;
      }

      if (type === "decline") {
        const resFriendDecline = await API.post("/friends/decline", {
          fromUserId,
        });

        if (!resFriendDecline.data.success) return false;
      }

      // Gửi phản hồi cho notification (cả accept / decline)
      const resNotification = await API.post(
        "/notifications/response/friend-request",
        {
          fromUserId,
          notificationId,
          type,
        }
      );

      return resNotification.data.success || false;
    } catch (error) {
      console.error("Error processing friend request:", error);
      if (error.response.status === 504) handle504();
      return false;
    }
  },
}));

export default useNotificationStore;
