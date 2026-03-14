import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default API;
