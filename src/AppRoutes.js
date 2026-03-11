// src/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/Admin";
import AuthLayout from "./layouts/Auth";

// Example user role
const userRole = "doctor";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {routes.map((route, idx) => {
          const Layout = route.layout === "/admin" ? AdminLayout : AuthLayout;

          return (
            <Route
              key={idx}
              path={route.layout + route.path}
              element={
                <Layout>
                  <ProtectedRoute allowedRoles={route.roles} userRole={userRole}>
                    {route.component}
                  </ProtectedRoute>
                </Layout>
              }
            />
          );
        })}
      </Routes>
    </Router>
  );
};

export default AppRoutes;