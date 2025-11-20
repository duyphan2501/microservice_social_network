import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";

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
      toast.error("Can't not load notifications");
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
      toast.error("Can't read notifications");
    }
  },
}));

export default useNotificationStore;
