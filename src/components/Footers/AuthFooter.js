import { NavItem, NavLink, Nav, Container, Row, Col } from "reactstrap";

const AuthFooter = () => {
  return (
    <footer className="py-5">
      <Container>
        <Row className="align-items-center justify-content-xl-between">
          <Col xl="6">
            <div className="copyright text-center text-xl-left text-muted">
              © {new Date().getFullYear()}{" "}
              <span className="font-weight-bold ml-1">
                Lab Management System
              </span>
              . All rights reserved.
            </div>
          </Col>
          <Col xl="6">
            <Nav className="nav-footer justify-content-center justify-content-xl-end">
              <NavItem>
                <NavLink href="/dashboard">Dashboard</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/patients">Patients</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/doctors">Doctors</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/tests">Tests</NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default AuthFooter;