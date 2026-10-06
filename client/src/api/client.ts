import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getApiUrl = (path: string) =>
  new URL(path, apiClient.defaults.baseURL).toString();

export default apiClient;
