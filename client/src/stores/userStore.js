import { create } from "zustand";
import { toast } from "react-toastify";
import API from "../API/axiosInstance";

const useUserStore = create((set) => ({
    user:  {
        id: 1,
        username: "duyphan",
        email: "duyneon09@gmail.com",
        full_name: "duyphan",
        avatar_url: "",
        bio: "",
        last_active_at: new Date(),
    }

}))

export default useUserStore