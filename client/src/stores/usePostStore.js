// store/postStore.js
import { create } from "zustand";
import useUserStore from "./useUserStore";
import { toast } from "react-toastify";
import API from "../API/axiosInstance";

export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,

  fetchPosts: async (axiosPrivate) => {
    const { isLoading, page, hasMore } = get();

    if (isLoading || !hasMore) return;

    set({ isLoading: true, error: null });

    try {
      const response = await axiosPrivate.get(`/posts?page=${page}&limit=10`);
      const newPosts = response.data.posts;

      if (newPosts.length === 0) {
        set({ isLoading: false, hasMore: false });
        return;
      }

      const userIdsToFetch = [...new Set(newPosts.map((post) => post.user_id))];
      const { fetchUserIfNeeded } = useUserStore.getState();
      await Promise.all(userIdsToFetch.map((id) => fetchUserIfNeeded(id)));

      set((state) => ({
        posts: [...state.posts, ...newPosts],
        page: state.page + 1,
        hasMore: newPosts.length === 10,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.message || "Lỗi khi tải bài viết",
        isLoading: false,
      });
    }
  },

  getPost: async (postId) => {
    const findPost = get().posts.find((post) => post.id === postId);
    if (findPost) return findPost;
    set({ isLoading: true });
    try {
      const res = await API.get(`/posts/${postId}`);
      return res.data.post;
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadPostMedia: async (formData, axiosPrivate) => {
    const res = await axiosPrivate.post(`/posts/upload-media`, formData);
    return res.data.uploadedMedia;
  },

  createNewPost: async (content, media, userId, axiosPrivate) => {
    const res = await axiosPrivate.post(`/posts/create`, { content, media });

    const newPost = {
      id: res.data.postId,
      user_id: userId,
      content,
      media,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date(),
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
    }));
  },

  saveLike: async (postId, axiosPrivate) => {
    const res = await axiosPrivate.post(`/posts/${postId}/like`);
    return res.data;
  },

  resetPosts: () =>
    set({
      posts: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      error: null,
    }),

  deletePost: async (postId, axiosPrivate) => {
    try {
      await axiosPrivate.delete(`/posts/delete/${postId}`);
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      }));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message || error);
    } finally {
    }
  },
}));

export default usePostStore;
