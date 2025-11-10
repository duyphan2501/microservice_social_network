import { create } from "zustand";
import { io } from "socket.io-client";
import useUserStore from "./useUserStore";
// Import các thứ khác nếu cần (API, toast)

const CHAT_SERVICE_URL =
  import.meta.env.VITE_CHAT_SERVICE_URL || "http://localhost:3002";
const POST_SERVICE_URL =
  import.meta.env.VITE_POST_SERVICE_URL || "http://localhost:3004";
const NOTIFICATION_SERVICE_URL =
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:3005";

const useSocketStore = create((set, get) => ({
  chatSocket: null,
  postSocket: null,
  notificationSocket: null,
  onlineUsers: [],

  // Hàm kết nối CHAT Service
  connectChatSocket: () => {
    try {
      const { user, accessToken } = useUserStore.getState();
      if (!user || get().chatSocket?.connected || !accessToken) {
        return;
      }

      const newSocket = io(CHAT_SERVICE_URL, {
        withCredentials: true,
        auth: { token: accessToken },
      });

      // Bắt các lỗi kết nối ở đây
      newSocket.on("connect_error", (err) => {
        console.error("Chat Socket Connection Error:", err.message);
      });

      newSocket.connect();
      set({ chatSocket: newSocket });

      // Lắng nghe sự kiện chỉ dành cho CHAT servicex
      newSocket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    } catch (error) {
      console.error("Error in connectChatSocket:", error);
    }
  },

  // Hàm kết nối POST Service
  connectPostSocket: () => {
    try {
      const { user, accessToken } = useUserStore.getState();

      if (!user || get().postSocket?.connected || !accessToken) return;

      const newSocket = io(POST_SERVICE_URL, {
        withCredentials: true,
        auth: { token: accessToken },
      });

      newSocket.on("connect_error", (err) => {
        console.error("Post Socket Connection Error:", err.message);
      });

      newSocket.connect();
      set({ postSocket: newSocket });

      // ... lắng nghe sự kiện POST ...
    } catch (error) {
      console.error("Error in connectPostSocket:", error);
    }
  },

  connectNotificationSocket: () => {
    try {
      const { user, accessToken } = useUserStore.getState();

      if (!user || get().notificationSocket?.connected || !accessToken) return;

      // Sửa URL ở đây: dùng NOTIFICATION_SERVICE_URL thay vì POST_SERVICE_URL
      const newSocket = io(NOTIFICATION_SERVICE_URL, {
        withCredentials: true,
        auth: { token: accessToken },
      });

      newSocket.on("connect_error", (err) => {
        console.error("Notification Socket Connection Error:", err.message);
      });

      newSocket.connect();
      set({ notificationSocket: newSocket });

      // ... lắng nghe sự kiện Notification ...
    } catch (error) {
      console.error("Error in connectNotificationSocket:", error);
    }
  },

  connectAllSockets: () => {
    get().connectChatSocket();
    // get().connectPostSocket();
    // get().connectNotificationSocket();
  },

  disconnectAllSockets: () => {
    get().chatSocket?.disconnect();
    get().postSocket?.disconnect();
    get().notificationSocket?.disconnect();
    set({
      chatSocket: null,
      postSocket: null,
      notificationSocket: null,
      onlineUsers: [],
    });
  },
}));

export default useSocketStore;
