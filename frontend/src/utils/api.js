import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("kb-auth") || "{}");
  const token = auth?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";
    const errorData = err.response?.data || {};
    const onAuthPage = ["/login", "/register"].includes(
      window.location.pathname,
    );
    const isAuthRequest =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/google");

    console.error("[API Error]", { status, url, errorData });

    if (status === 401 && !isAuthRequest && !onAuthPage) {
      localStorage.removeItem("kb-auth");
      window.location.href = "/login";
    }

    // Create error object with message and data
    const error = new Error(
      errorData.message || err.message || "Request failed",
    );
    error.data = errorData;
    error.status = status;
    return Promise.reject(error);
  },
);

export default api;
