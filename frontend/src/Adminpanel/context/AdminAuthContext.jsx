import React, { createContext, useContext, useState, useEffect } from "react";
import adminAxios from "../utils/adminAxios";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if a token already exists and validate it against the backend
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await adminAxios.get("/auth/me");
        if (res.data.success) {
          setAdmin(res.data.admin);
        }
      } catch (err) {
        // Token invalid/expired — interceptor already cleared storage
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await adminAxios.post("/auth/login", { email, password });
    if (res.data.success) {
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await adminAxios.post("/auth/logout");
    } catch {
      // Even if the API call fails, clear local session
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};