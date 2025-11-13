// store/postStore.js
import { create } from "zustand";
import useUserStore from "./useUserStore";

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
      const response = await axiosPrivate.get(`/posts?page=${page}&limit=1`);
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
        hasMore: newPosts.length === 1,
        isLoading: false,
      }));

    } catch (error) {
      set({
        error: error.message || "Lỗi khi tải bài viết",
        isLoading: false,
      });
    }
  },

  resetPosts: () =>
    set({
      posts: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      error: null,
    }),
}));

export default usePostStore;
