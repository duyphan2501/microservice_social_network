import { create } from "zustand";
import { toast } from "react-toastify";
import { safeToastError } from "../utils/toastLimiter";
const handle504 = () => {
  console.log("504 Gateway Timeout");
  safeToastError("The system chat is under maintenance. Please try again.");
};

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
      if (error.response.status === 504) handle504();
      else toast.error(message);
    }
  },

  sendMessage: async (messageData, axiosPrivate) => {
    try {
      const res = await axiosPrivate.post(`/chat/messages/send`, messageData);
      return res.data.savedMessage;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      if (error.response.status === 504) handle504();
      else toast.error(message);
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
      if (error.response.status === 504) handle504();
      else toast.error(message);
    }
  },
}));

export default useMessageStore;
