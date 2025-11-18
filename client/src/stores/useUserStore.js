import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";

const useUserStore = create((set, get) => {
  const login = async (user) => {
    set({ isLoading: { login: true } });
    try {
      const res = await API.post(`/users/login`, user);
      set({ user: res.data.user, accessToken: res.data.accessToken });

      toast.success(res.data.message);
      return { success: true, loginUser: res.data.user };
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || message;
        if (error.response.status === 401 && error.response.data.notVerified) {
          const user = error.response.data?.user;
          toast.info(message || "Please verify your account");
          return { success: false, loginUser: user };
        } else {
          toast.error(message || "Failed to sign up");
        }
      }
      return { success: false, loginUser: null };
    } finally {
      set({ isLoading: { login: false } });
    }
  };

  const refreshToken = async () => {
    set({ isLoading: { refresh: true } });
    try {
      const res = await API.put(`/users/refresh-token`);
      set({
        user: res.data.user,
        accessToken: res.data.accessToken,
      });
      return { accessToken: res.data.accessToken };
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: { refresh: false } });
    }
  };

  const refreshUser = async () => {
    try {
      const res = await API.get("/users/refresh-user");

      set({
        user: res.data.user,
      });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (user) => {
    set({ isLoading: { signUp: true } });
    try {
      const res = await API.post(`/users/sign-up`, user);
      toast.success(res.data.message);
      set({ user: res.data.user });
      return { user: res.data.user, success: true };
    } catch (error) {
      console.error(error);
      if (error.response) {
        const message = error.response.data?.message || "Failed to sign up";
        toast.error(message);
      }
    } finally {
      set({ isLoading: { signUp: false } });
    }
  };

  const verifyAccount = async (formData) => {
    set({ isLoading: { verify: true } });
    try {
      const res = await API.put(`/users/verify-account`, formData);
      toast.success(res.data.message);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to verify account");
      return false;
    } finally {
      set({ isLoading: { verify: false } });
    }
  };

  const sendVerificationEmail = async (email) => {
    set({ isLoading: { resend: true } });
    try {
      const res = await API.put(`/users/resend-verification-email`, {
        email,
      });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to resend verification email"
      );
      return false;
    } finally {
      set({ isLoading: { resend: false } });
    }
  };

  const sendForgotPasswordEmail = async (email) => {
    set({ isLoading: { forgot: true } });
    try {
      const res = await API.post(`/users/forgot-password`, { email });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to send forgot password email"
      );
      return false;
    } finally {
      set({ isLoading: { forgot: false } });
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    set({ isLoading: { reset: true } });
    try {
      const res = await API.put(`/users/reset-password`, {
        token,
        password,
        confirmPassword,
      });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to reset password");
      return false;
    } finally {
      set({ isLoading: { reset: false } });
    }
  };

  const logout = async () => {
    try {
      const res = await API.delete(`/users/logout`);
      toast.info(res.data.message);
      set({ user: null, accessToken: null });
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to logout");
      return false;
    }
  };

  const updatePersonalInfo = async (name, phone, axiosPrivate) => {
    try {
      const res = await axiosPrivate.put(`/users/personal-info/update`, {
        name,
        phone,
      });
      toast.success(res.data.message);
      set({ user: res.data.user });
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    }
  };

  const changePassword = async (formData, axiosPrivate) => {
    set({ isLoading: { change: true } });
    try {
      const res = await API.put(`/users/change-password`, formData);
      toast.success(res.data.message);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to change password");
      return false;
    } finally {
      set({ isLoading: { change: false } });
    }
  };

  const getUserInfo = async (userId, axiosPrivate) => {
    try {
      const res = await API.get(`/users/get-info/${userId}`);
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  };

  const refreshUserInfo = async (userId, axiosPrivate) => {
    try {
      const res = await axiosPrivate.get(`/users/get-info/${userId}`);
      set(() => ({
        user: res.data.user,
      }));
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message;
      console.error(error);
      toast.error(message);
    }
  };

  const fetchUserIfNeeded = async (userId) => {
    const { usersCache } = get();

    if (usersCache[userId]) {
      return usersCache[userId];
    }

    try {
      const response = await API.get(`/users/get-info/${userId}`);
      const userInfo = response.data.user;

      // Cập nhật cache
      set((state) => ({
        usersCache: {
          ...state.usersCache,
          [userId]: userInfo,
        },
      }));

      return userInfo;
    } catch (error) {
      console.error(`Could not fetch user ${userId}:`, error);
      return null;
    }
  };

  return {
    usersCache: {},
    user: null,
    accessToken: null,
    isLoading: {
      login: false,
      refresh: false,
      signUp: false,
      verify: false,
      resend: false,
      forgot: false,
      reset: false,
      change: false,
    },
    login,
    refreshToken,
    refreshUser,
    signUp,
    verifyAccount,
    sendVerificationEmail,
    sendForgotPasswordEmail,
    resetPassword,
    logout,
    updatePersonalInfo,
    changePassword,
    getUserInfo,
    fetchUserIfNeeded,
    refreshUserInfo,
  };
});

export default useUserStore;
