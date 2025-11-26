import { create } from "zustand";
import { toast } from "react-toastify";
import { safeToastError } from "../utils/toastLimiter";

const handle504 = () => {
  console.log("504 Gateway Timeout");
  safeToastError("The system chat is under maintenance. Please try again.");
};

const useConversationStore = create((set, get) => ({
  isLoading: { getByUser: false },
  getConversations: async (userId, status = "active", axiosPrivate) => {
    try {
      const res = await axiosPrivate.get(
        `/chat/conversations/user/${userId}?status=${status}`
      );
      return res.data.conversations;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      if (error.response.status === 504) handle504();
      else toast.error(message);
    }
  },

  getConversationByUser: async (chatUserId, axiosPrivate) => {
    set({ isLoading: { getByUser: true } });
    try {
      const res = await axiosPrivate.get(
        `/chat/conversations/chat-user/${chatUserId}`
      );
      return res.data.conversation;
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: { getByUser: false } });
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
      if (error.response.status === 504) handle504();
      else toast.error(message);
    }
  },
  createNewConversation: async (partnerId, axiosPrivate) => {
    try {
      const res = await axiosPrivate.post("/chat/conversations/create", {
        partnerId,
      });
      return res.data.insertId;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      if (error.response.status === 504) handle504();
      else toast.error(message);
    }
  },

  updateStatusConversation: async (conversationId, status, axiosPrivate) => {
    try {
      await axiosPrivate.put(`/chat/conversations/status/update`, {
        conversationId,
        status,
      });
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      if (error.response.status === 504) handle504();
      else toast.error(message);
    }
  },
}));

export default useConversationStore;
