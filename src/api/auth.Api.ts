import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

authApi.interceptors.request.use((config) => {
  config.headers["X-Client"] = "web";
  return config;
});

export default authApi;
