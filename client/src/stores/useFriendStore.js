import { create } from "zustand";
import API from "../API/axiosInstance";
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
}));

export default useFriendStore;
