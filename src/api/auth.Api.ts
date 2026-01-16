import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

authApi.interceptors.request.use((config) => {
  config.headers["X-Client"] = "web";
  return config;
});

export default authApi;
