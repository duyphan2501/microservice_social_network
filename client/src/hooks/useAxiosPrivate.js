import { useContext, useEffect } from "react";
import axiosPrivate from "../API/axiosInstance.js";
import { MyContext } from "../Context/MyContext.jsx";
import useUserStore from "../store/useUserStore.js";

const useAxiosPrivate = () => {
  const { refreshToken } = useUserStore();
  const { persist } = useContext(MyContext);

  useEffect(() => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        const token = useUserStore.getState().accessToken;
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !prevRequest._retry &&
          persist
        ) {
          prevRequest._retry = true;
          try {
            const refreshed = await refreshToken();
            prevRequest.headers = {
              ...prevRequest.headers,
              Authorization: `Bearer ${refreshed.accessToken}`,
            };
            return axiosPrivate(prevRequest);
          } catch (err) {
            useUserStore.getState().logout();
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken, persist]);

  return axiosPrivate;
};

export default useAxiosPrivate;
