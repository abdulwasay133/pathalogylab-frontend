import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// reactstrap components
import { Container, Row } from "reactstrap";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";

import routes from "routes.js";

const Auth = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.body.classList.add("bg-default");
    return () => {
      document.body.classList.remove("bg-default");
    };
  }, []);
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      <div className="auth-layout-bg" aria-hidden="true" style={{backgroundColor:'black'}} />
      <div className="main-content" ref={mainContent} 
style={{
  position: "relative",
  zIndex: 1,
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/images/three.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}
        >
        {/* <AuthNavbar /> */}
        <div className="py-2 py-lg-7"  >
        </div>
        {/* Page content */}
        <Container className="mt--8 pb-5">
          <Row className="justify-content-center">
            <Routes>
              {getRoutes(routes)}
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Auth;
