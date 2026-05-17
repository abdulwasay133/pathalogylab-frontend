import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import api from "api/axios";
import { toast } from "utils/toast";

const AdminNavbar = (props) => {
  const navigate  = useNavigate();

  // ── Pull logged-in user from localStorage ──────────────────────────
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName   = user?.name  || "Admin";
  const userEmail  = user?.email || "";

  // ── Get initials for avatar fallback ──────────────────────────────
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ── Logout ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      const res = await api.post("/logout");
      if (res.status === 200) {
        toast.success(res.data.message || "Logged out successfully");
      }
    } catch (err) {
      // even if API fails, clear local storage and redirect
      toast.info("Logged out");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth/login");
    }
  };

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>

          {/* ── Brand / Page Title ── */}
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/admin/dashboard"
          >
            {props.brandText}
          </Link>



          {/* ── Right Side Nav ── */}
          <Nav className="align-items-center d-none d-md-flex" navbar>

            {/* ── User Dropdown ── */}
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">

                  {/* Avatar: initials circle (no broken image) */}
                  <span
                    className="avatar avatar-sm rounded-circle d-flex align-items-center justify-content-center font-weight-bold text-white"
                    style={{
                      background: "linear-gradient(87deg, #5e72e4 0, #825ee4 100%)",
                      fontSize: "0.75rem",
                      width: 36,
                      height: 36,
                    }}
                  >
                    {getInitials(userName)}
                  </span>

                  {/* Name */}
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold text-white">
                      {userName}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>

              <DropdownMenu className="dropdown-menu-arrow" right>

                {/* Header */}
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome, {userName.split(" ")[0]}! 👋</h6>
                  <p className="text-muted text-xs m-0">{userEmail}</p>
                </DropdownItem>

                <DropdownItem divider />

                {/* Nav Items */}
                <DropdownItem to="/admin/dashboard" tag={Link}>
                  <i className="ni ni-tv-2 text-primary" />
                  <span>Dashboard</span>
                </DropdownItem>

                <DropdownItem to="/admin/patients" tag={Link}>
                  <i className="fas fa-user-injured text-info" />
                  <span>Patients</span>
                </DropdownItem>

                <DropdownItem to="/admin/doctors" tag={Link}>
                  <i className="fas fa-user-md text-success" />
                  <span>Doctors</span>
                </DropdownItem>

                <DropdownItem to="/admin/tests" tag={Link}>
                  <i className="fas fa-vials text-warning" />
                  <span>Tests</span>
                </DropdownItem>

                <DropdownItem divider />

                {/* Logout */}
                <DropdownItem onClick={handleLogout} style={{ cursor: "pointer" }}>
                  <i className="ni ni-user-run text-danger" />
                  <span className="text-danger">Logout</span>
                </DropdownItem>

              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>

        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;