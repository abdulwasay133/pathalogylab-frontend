import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const login = async (email, password) => {
    const response = await api.post("/login", { email, password });

    localStorage.setItem("token", response.data.token);

    setUser(response.data.user);
    setRoles(response.data.roles);
    setPermissions(response.data.permissions);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ user, roles, permissions, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};