import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F9F8]">
        <div className="animate-spin h-8 w-8 border-2 border-dark-green border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;