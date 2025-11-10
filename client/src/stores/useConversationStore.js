import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";

const useConversationStore = create((set, get) => ({
  isLoading: false,

  getConversations: async (userId, axiosPrivate) => {
    set({ isLoading: true });
    try {
      const res = await axiosPrivate.get(`/chat/conversations/${userId}`);
      return res.data.conversations;
    } catch (error) {
        const message = error.response?.data?.message;
        console.error(error)
        toast.error(message)
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useConversationStore;
