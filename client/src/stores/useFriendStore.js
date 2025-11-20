import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";
const useFriendStore = create((set, get) => ({
  friends: [],
  count: 0,

  countFriends: async (userId, axiosPrivate) => {
    try {
      const res = await API.get(`/friends/count/${userId}`);

      set({ count: res.data.count });
      return res.data.count;
    } catch (error) {
      console.error("Error fetching friend count:", error);
      toast.error("Failed to fetch friend count");
      return 0;
    }
  },

  acceptFriendRequest: async (fromUserId, notificationId) => {
    try {
      const res = await API.post("/friends/accept", {
        fromUserId,
        notificationId,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        return res.data.success;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept the request!");
    }
  },
}));

export default useFriendStore;
