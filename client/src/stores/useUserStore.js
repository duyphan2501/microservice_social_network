import { create } from "zustand";
import API from "../API/axiosInstance";
import { toast } from "react-toastify";
import { safeToastError } from "../utils/toastLimiter";

const useUserStore = create((set, get) => {
  const handle504 = () => {
    console.log("504 Gateway Timeout");
    safeToastError("The system user is under maintenance. Please try again.");
  };

  const login = async (user) => {
    set({ isLoading: { login: true } });
    try {
      const res = await API.post(`/users/login`, user);
      set({ user: res.data.user, accessToken: res.data.accessToken });

      toast.success(res.data.message);
      return { success: true, loginUser: res.data.user };
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message;
        if (error.response.status === 401 && error.response.data.notVerified) {
          const user = error.response.data?.user;
          toast.info(message || "Please verify your account");
          return { success: false, loginUser: user };
        } else if (error.response.status === 504) {
          handle504();
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
      if (error.response?.status === 504) handle504();
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
        accessToken: res.data.accessToken,
      });
    } catch (error) {
      if (error.response?.status === 504) handle504();
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
        if (error.response.status === 504) return handle504();
        toast.error(error.response.data?.message || "Failed to sign up");
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
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
      toast.error(error.response?.data?.message || "Failed to verify account");
      return false;
    } finally {
      set({ isLoading: { verify: false } });
    }
  };

  const sendVerificationEmail = async (email) => {
    set({ isLoading: { resend: true } });
    try {
      const res = await API.put(`/users/resend-verification-email`, { email });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
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
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
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
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
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
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
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
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
      toast.error(error.response?.data?.message || "Failed to update");
      return false;
    }
  };

  const changePassword = async (formData, axiosPrivate) => {
    set({ isLoading: { change: true } });
    try {
      const res = await axiosPrivate.put(`/users/change-password`, formData);
      toast.success(res.data.message);
      return true;
    } catch (error) {
      if (error.response?.status === 504) {
        handle504();
        return false;
      }
      toast.error(error.response?.data?.message || "Failed to change password");
      return false;
    } finally {
      set({ isLoading: { change: false } });
    }
  };

  const getUserInfo = async (userId) => {
    try {
      const res = await API.get(`/users/get-info/${userId}`);
      return res.data.user;
    } catch (error) {
      if (error.response?.status === 504) return handle504();
      toast.error(error.response?.data?.message);
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
      if (error.response?.status === 504) return handle504();
      toast.error(error.response?.data?.message);
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

      set((state) => ({
        usersCache: {
          ...state.usersCache,
          [userId]: userInfo,
        },
      }));

      return userInfo;
    } catch (error) {
      if (error.response?.status === 504) handle504();
      console.error(`Could not fetch user ${userId}:`, error);
      return null;
    }
  };

  const searchUsers = async (term) => {
    try {
      const res = await API.get(`/users/search?term=${term}`);
      return res.data.users || [];
    } catch (error) {
      if (error.response?.status === 504) handle504();
      return [];
    }
  };

  const getUserByUsername = async (username, axiosPrivate) => {
    try {
      const res = await axiosPrivate.get(`/users/username/${username}`);
      return res.data.user || null;
    } catch (error) {
      if (error.response?.status === 504) handle504();
      return null;
    }
  };

  const setUser = (user) => {
    set({ user });
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
    searchUsers,
    getUserByUsername,
    setUser,
  };
});

export default useUserStore;
