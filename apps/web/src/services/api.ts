import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("goalsync.accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message ?? "Request failed";
    toast.error(message);
    throw error;
  }
);
