import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar     from "components/Sidebar/Sidebar.js";

import routes            from "routes.js";
import { useAuth }       from "context/AuthContext";
import { flattenRoutes, filterByRoles } from "utils/routeFilter";

const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location    = useLocation();
  const { roles }   = useAuth();

  /* ── scroll to top on route change ── */
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    if (mainContent.current) mainContent.current.scrollTop = 0;
  }, [location]);

  /* ── flatten grouped routes + filter by logged-in user roles ── */
  const allowedRoutes = filterByRoles(flattenRoutes(routes), roles);

  /* ── build <Route> elements ── */
  const getRoutes = () =>
    allowedRoutes
      .filter(r => r.layout === "/admin" && r.path && r.component)
      .map((prop, key) => (
        <Route path={prop.path} element={prop.component} key={key} />
      ));

  /* ── active page title for navbar ── */
  const getBrandText = () => {
    const flat = flattenRoutes(routes);
    for (const route of flat) {
      if (
        route.layout &&
        route.path &&
        location.pathname.includes(route.layout + route.path.replace(/\/:[^/]+/g, ""))
      ) {
        return route.name || "Dashboard";
      }
    }
    return "Dashboard";
  };

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc:    require("../assets/img/brand/argon-react.png"),
          imgAlt:    "LIMS",
        }}
      />

      <div className="main-content" ref={mainContent}>
        <AdminNavbar
          {...props}
          brandText={getBrandText()}
        />

        <Routes>
          {getRoutes()}

          {/* fallback redirect */}
          <Route path="*" element={<Navigate to="/admin/index" replace />} />
        </Routes>

        <Container fluid>
          <AdminFooter />
        </Container>
      </div>
    </>
  );
};

export default Admin;