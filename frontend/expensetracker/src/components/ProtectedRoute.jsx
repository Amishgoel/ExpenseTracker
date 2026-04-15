import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default ProtectedRoute;
