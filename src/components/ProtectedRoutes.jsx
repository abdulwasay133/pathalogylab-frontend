// components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isAuth = !!localStorage.getItem("token"); // or your auth check

  return isAuth ? <Outlet /> : <Navigate to="/auth/login" replace />;
}