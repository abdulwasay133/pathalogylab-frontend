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
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg,#5e72e4,#825ee4)",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24,
          animation: "pulse 1.4s ease-in-out infinite",
          boxShadow: "0 8px 20px rgba(94,114,228,.35)",
        }}>
          🔬
        </div>
        <p style={{ color: "#8898aa", fontWeight: 600, fontSize: 14, margin: 0 }}>
          Loading…
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