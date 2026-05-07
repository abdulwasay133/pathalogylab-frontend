import React from "react";
import ReactDOM from "react-dom/client";
import {  Route, Routes, Navigate, HashRouter } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "react-toastify/dist/ReactToastify.css";
// import "bootstrap/dist/css/bootstrap.min.css";

import AdminLayout    from "layouts/Admin.js";
import AuthLayout     from "layouts/Auth.js";
import ProtectedRoute from "routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";

// ✅ Import AuthProvider
import { AuthProvider } from "context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(

  // ✅ AuthProvider is the outermost wrapper so every component
  //    including ProtectedRoute and Login can call useAuth()
  <AuthProvider>
    <HashRouter basename='/'>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>

        {/* ── Protected admin area ── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        {/* ── Public auth pages (login / register) ── */}
        <Route path="/auth/*" element={<AuthLayout />} />

        {/* ── Catch-all → redirect to login ── */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />

      </Routes>

    </HashRouter>
  </AuthProvider>

);