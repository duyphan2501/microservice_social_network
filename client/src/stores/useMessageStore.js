import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";

const useMessageStore = create((set, get) => ({
  uploadMessageImages: async (imagesData, axiosPrivate) => {
    try {
      const res = await axiosPrivate.post(
        `/chat/messages/upload-images`,
        imagesData
      );
      return res.data.uploadedImages;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  },

  sendMessage: async (messageData, axiosPrivate) => {
    try {
      const res = await axiosPrivate.post(`/chat/messages/send`, messageData);
      return res.data.savedMessage;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  },

  updateMessageStatus: async (
    conversationId,
    messageId,
    userId,
    status,
    axiosPrivate
  ) => {
    try {
      await axiosPrivate.put(`/chat/messages/status`, {
        conversationId,
        messageId,
        userId,
        status,
      });
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  },
}));

export default useMessageStore;
