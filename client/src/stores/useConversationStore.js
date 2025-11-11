import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";

const useConversationStore = create((set, get) => ({
  getConversations: async (userId, axiosPrivate) => {
    try {
      const res = await axiosPrivate.get(`/chat/conversations/${userId}`);
      return res.data.conversations;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  },

  getConversationMessages: async (
    conversationId,
    limit,
    beforeId,
    axiosPrivate
  ) => {
    try {
      const res = await axiosPrivate.get(
        `/chat/conversations/${conversationId}/messages?limit=${limit}&beforeId=${beforeId}`
      );
      return res.data.messages;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  },
}));

export default useConversationStore;
