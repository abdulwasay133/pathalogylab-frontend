// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

/**
 * Wraps any route that requires authentication.
 * Optionally accepts a `role` or `permission` prop for fine-grained access.
 *
 * Usage in index.js:
 *   <ProtectedRoute>              → just requires login
 *   <ProtectedRoute role="admin"> → requires admin role
 *   <ProtectedRoute permission="doctor.view"> → requires permission
 */
export default function ProtectedRoute({ children, role, permission }) {
  const { user, loading, hasRole, hasPermission } = useAuth();

  /* ── still fetching /me ── */
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#f8f9fe", gap: 16,
      }}>

          <img
            src="/images/loader.gif"
            alt="lims-logo"
            style={{ width: "10%", height: "10%", objectFit: "contain" }}
          />
        <p style={{ color: "#8898aa", fontWeight: 600, fontSize: 14, margin: 0 }}>
          Loading secure dashboard…
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1);    }
            50%       { opacity: .6; transform: scale(.94); }
          }
        `}</style>
      </div>
    );
  }

  /* ── not logged in → go to login ── */
  if (!user) return <Navigate to="/auth/login" replace />;

  /* ── wrong role ── */
  if (role && !hasRole(role)) return <Navigate to="/admin/unauthorized" replace />;

  /* ── missing permission ── */
  if (permission && !hasPermission(permission)) return <Navigate to="/admin/unauthorized" replace />;

  return children;
}