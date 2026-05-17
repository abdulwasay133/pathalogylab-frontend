import React, { useState } from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";
import { useAuth } from "context/AuthContext";
import { flattenRoutes, filterByRoles } from "utils/routeFilter";

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();
  const { roles } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    if (mainContent.current) mainContent.current.scrollTop = 0;
  }, [location]);

  const allowedRoutes = filterByRoles(flattenRoutes(routes), roles);

  const getRoutes = () =>
    allowedRoutes
      .filter((r) => r.layout === "/admin" && r.path && r.component)
      .map((prop, key) => (
        <Route path={prop.path} element={prop.component} key={key} />
      ));

  const getBrandText = () => {
    const flat = flattenRoutes(routes);
    for (const route of flat) {
      if (
        route.layout &&
        route.path &&
        location.pathname.includes(
          route.layout + route.path.replace(/\/:[^/]+/g, "")
        )
      ) {
        return route.name || "Dashboard";
      }
    }
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        {...props}
        routes={routes}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("../assets/img/brand/argon-react.png"),
          imgAlt: "PrimeLIMS",
        }}
      />

      <div className="flex min-h-screen flex-col md:pl-64" ref={mainContent}>
        <AdminNavbar
          brandText={getBrandText()}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1">
          <Routes>
            {getRoutes()}
            <Route path="*" element={<Navigate to="/admin/index" replace />} />
          </Routes>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default Admin;
