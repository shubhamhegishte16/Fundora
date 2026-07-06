import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminAxios = axios.create({
  baseURL: `${API_BASE}/admin`,
});

// Attach the admin token to every outgoing request automatically
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If the token is invalid/expired, the backend returns 401 — log the admin out automatically
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      // Avoid redirect loop if already on the login page
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default adminAxios;