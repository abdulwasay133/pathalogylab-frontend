// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "api/axios";

/* ── safe default so useAuth() never returns null ── */
const AuthContext = createContext({
  user:           null,
  roles:          [],
  permissions:    [],
  loading:        true,
  hasRole:        () => false,
  hasPermission:  () => false,
  isAdmin:        () => false,
  login:          async () => {},
  logout:         () => {},
  setUser:        () => {},
  setRoles:       () => {},
  setPermissions: () => {},
});

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [roles,       setRoles]       = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  /* ── On app boot: if token exists, fetch /me ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Token already in localStorage so axios interceptor will send it
    api.get("/me")
      .then((res) => {
        setUser(res.data);
        setRoles(res.data.roles        || []);
        setPermissions(res.data.permissions || []);
      })
      .catch(() => {
        // Token is invalid or expired — clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── helpers ── */
  const hasRole       = (role)       => roles.includes(role);
  const hasPermission = (permission) => permissions.includes(permission);
  const isAdmin       = ()           => roles.includes("admin");

  /* ── login ── */
  const login = async (email, password) => {
    // Step 1: get token from login endpoint
    const res = await api.post("/login", { email, password });

    const token = res.data.data.token;

    // Step 2: save token to localStorage FIRST
    // The axios interceptor reads from localStorage on every request,
    // so /me will automatically get the Authorization header.
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(res.data.data.user || ""));

    // Step 3: NOW fetch /me — interceptor will attach the token
    const me = await api.get("/me");

    setUser(me.data);
    setRoles(me.data.roles        || []);
    setPermissions(me.data.permissions || []);

    return me.data;
  };

  /* ── logout ── */
  const logout = () => {
    api.post("/logout").catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{
      user, roles, permissions, loading,
      hasRole, hasPermission, isAdmin,
      login, logout,
      setUser, setRoles, setPermissions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── hook ── */
export const useAuth = () => useContext(AuthContext);