import { useState } from "react";
import { Row, Col, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge } from "reactstrap";

const Footer = () => {
  const [licenseModal, setLicenseModal] = useState(false);

  const toggle = () => setLicenseModal(!licenseModal);

  const licenses = [
    {
      package: "React",
      version: "18.x",
      license: "MIT",
      author: "Meta (Facebook)",
      url: "https://github.com/facebook/react/blob/main/LICENSE",
    },
    {
      package: "Laravel",
      version: "11.x",
      license: "MIT",
      author: "Taylor Otwell",
      url: "https://github.com/laravel/laravel/blob/master/LICENSE.md",
    },
    {
      package: "Argon Dashboard",
      version: "1.x",
      license: "MIT",
      author: "Creative Tim",
      url: "https://github.com/creativetimofficial/argon-dashboard/blob/master/LICENSE.md",
    },
    {
      package: "Reactstrap",
      version: "9.x",
      license: "MIT",
      author: "Reactstrap Contributors",
      url: "https://github.com/reactstrap/reactstrap/blob/master/LICENSE",
    },
    {
      package: "Chart.js",
      version: "2.x",
      license: "MIT",
      author: "Chart.js Contributors",
      url: "https://github.com/chartjs/Chart.js/blob/master/LICENSE.md",
    },
    {
      package: "Axios",
      version: "1.x",
      license: "MIT",
      author: "Matt Zabriskie",
      url: "https://github.com/axios/axios/blob/master/LICENSE",
    },
    {
      package: "Laravel Sanctum",
      version: "3.x",
      license: "MIT",
      author: "Taylor Otwell",
      url: "https://github.com/laravel/sanctum/blob/master/LICENSE.md",
    },
  ];

  return (
    <>
      <footer className="footer">
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
              <NavItem>
                <NavLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); toggle(); }}
                  className="font-weight-bold text-primary"
                  style={{ cursor: "pointer" }}
                >
                  <i className="fas fa-file-alt mr-1" />
                  License
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
      </footer>

      {/* ── License Modal ── */}
      <Modal isOpen={licenseModal} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle} className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div
              className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow mr-3"
              style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <i className="fas fa-file-alt" />
            </div>
            <div>
              <h4 className="mb-0">Open Source Licenses</h4>
              <p className="text-muted text-sm mb-0">
                Third-party packages used in this project
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="pt-2">
          {/* Info Banner */}
          <div
            className="alert alert-info d-flex align-items-center mb-4"
            style={{ borderRadius: 8, fontSize: "0.85rem" }}
          >
            <i className="fas fa-info-circle mr-2" />
            This project is built using the following open-source packages. 
            All packages are licensed under their respective licenses listed below.
          </div>

          {/* License Table */}
          <div className="table-responsive">
            <table className="table table-hover align-items-center">
              <thead className="thead-light">
                <tr>
                  <th style={{ fontSize: "0.75rem" }}>Package</th>
                  <th style={{ fontSize: "0.75rem" }}>Version</th>
                  <th style={{ fontSize: "0.75rem" }}>License</th>
                  <th style={{ fontSize: "0.75rem" }}>Author</th>
                  <th style={{ fontSize: "0.75rem" }}>Link</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span className="font-weight-bold text-sm">{item.package}</span>
                    </td>
                    <td>
                      <span className="text-muted text-sm">{item.version}</span>
                    </td>
                    <td>
                      <Badge color="success" pill style={{ fontSize: "0.7rem" }}>
                        {item.license}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted text-sm">{item.author}</span>
                    </td>
                    <td>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm"
                      >
                        <i className="fas fa-external-link-alt mr-1" />
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModalBody>

        <ModalFooter className="border-0 pt-0">
          <span className="text-muted text-sm mr-auto">
            <i className="fas fa-shield-alt mr-1 text-success" />
            All packages comply with open-source usage terms.
          </span>
          <Button color="primary" size="sm" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Footer;