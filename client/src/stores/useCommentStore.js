import { create } from "zustand";
import { toast } from "react-toastify";
import API from "../API/axiosInstance";
import useUserStore from "./useUserStore";

export const useCommentStore = create((set, get) => ({
  isLoading: false,

  getPostComments: async (postId) => {
    set({ isLoading: true });
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      const fetchedComments = res.data.comments;
      const userIdsToFetch = [
        ...new Set(fetchedComments.map((comment) => comment.user_id)),
      ];
      const { fetchUserIfNeeded } = useUserStore.getState();
      await Promise.all(userIdsToFetch.map((id) => fetchUserIfNeeded(id)));

      return fetchedComments;
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || error);
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (postId, parentId, content, axiosPrivate) => {
    const res = await axiosPrivate.post("/posts/comments/add", {
      postId,
      parentId,
      content,
    });
    return res.data.comment;
  },
}));

export default useCommentStore;
