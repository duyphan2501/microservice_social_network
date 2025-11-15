import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";

const useMessageStore = create((set, get) => ({
  uploadMessageImages: async (imagesData, axiosPrivate) => {
    try {
      const res = await axiosPrivate.post(`/chat/messages/upload-images`, imagesData);
      return res.data.uploadedImages;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  },
}));

export default useMessageStore;
