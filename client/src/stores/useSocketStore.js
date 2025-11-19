import { create } from "zustand";
import { io } from "socket.io-client";
import useUserStore from "./useUserStore";
// Import các thứ khác nếu cần (API, toast)

const SOCKET_GATEWAY_URL =
  import.meta.env.VITE_SOCKET_GATEWAY_URL || "http://localhost:3000";

const useSocketStore = create((set, get) => ({
  mainSocket: null,
  onlineUsers: [],

  connectMainSocket: () => {
    try {
      const { accessToken } = useUserStore.getState();

      // Nếu đã kết nối rồi thì return luôn
      if (get().mainSocket?.connected) {
        return;
      }

      // Khởi tạo kết nối tới GATEWAY SERVICE
      const newSocket = io(SOCKET_GATEWAY_URL, {
        withCredentials: true,
        // Gửi token (nếu có). Gateway sẽ kiểm tra và gán userId hoặc để null (khách)
        auth: { token: accessToken || null },
      });

      // Bắt các lỗi kết nối
      newSocket.on("connect_error", (err) => {
        console.error("Main Socket Connection Error:", err.message);
      });

      // Lắng nghe các sự kiện CHUNG từ Gateway
      newSocket.on("connect", () => {
        console.log("Connected to Main Socket Gateway!");
      });

      // Lắng nghe sự kiện Online Users (dù là user hay guest đều nhận được)
      newSocket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });

      // Lưu socket vào store
      set({ mainSocket: newSocket });
    } catch (error) {
      console.error("Error in connectMainSocket:", error);
    }
  },

  // Hàm ngắt kết nối chung
  disconnectMainSocket: () => {
    get().mainSocket?.disconnect();
    set({
      mainSocket: null,
      onlineUsers: [],
    });
  },
}));

export default useSocketStore;
