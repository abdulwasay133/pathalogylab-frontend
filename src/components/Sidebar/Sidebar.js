import { useState } from "react";
import { NavLink as RouterNavLink, Link, useLocation } from "react-router-dom";
import { PropTypes } from "prop-types";
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  NavbarBrand,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";
import { useAuth } from "context/AuthContext";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const T = {
  bg:           "#ffffff",
  border:       "#e9ecef",
  text:         "#525f7f",
  textMuted:    "#adb5bd",
  textActive:   "#5e72e4",
  activeBg:     "#f0f3ff",
  activeBorder: "#5e72e4",
  hoverBg:      "#f8f9fe",
  subActiveBg:  "#e8ecfd",
  subBorder:    "#825ee4",
};

/* ── check if a route is visible for given user roles ── */
const isVisible = (route, userRoles) => {
  if (!route.roles || route.roles.length === 0) return true;
  return route.roles.some(r => userRoles.includes(r));
};

/* ── check if a group has at least one visible child ── */
const hasVisibleChildren = (route, userRoles) =>
  (route.children || []).some(child => isVisible(child, userRoles));

/* ══════════════════════════════════════════════════════════
   SINGLE LINK
══════════════════════════════════════════════════════════ */
function SingleLink({ prop, onClick }) {
  const location = useLocation();
  const fullPath = prop.layout + prop.path;
  const active   = location.pathname === fullPath || location.pathname.startsWith(fullPath + "/");

  return (
    <li style={{ listStyle: "none", margin: "1px 8px" }}>
      <RouterNavLink
        to={fullPath}
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 14px", borderRadius: 10,
          textDecoration: "none", fontSize: 13,
          fontWeight: active ? 700 : 500,
          color:      active ? T.textActive : T.text,
          background: active ? T.activeBg   : "transparent",
          borderLeft: `3px solid ${active ? T.activeBorder : "transparent"}`,
          transition: "all .15s",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.hoverBg; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <i className={prop.icon} style={{ width: 18, textAlign: "center", fontSize: 13, flexShrink: 0, color: active ? T.textActive : T.textMuted }} />
        <span>{prop.name}</span>
      </RouterNavLink>
    </li>
  );
}

/* ══════════════════════════════════════════════════════════
   GROUP LINK (collapsible)
══════════════════════════════════════════════════════════ */
function GroupLink({ prop, userRoles, onChildClick }) {
  const location = useLocation();

  // only show children the user has access to
  const visibleChildren = (prop.children || []).filter(c => isVisible(c, userRoles));

  const groupActive = visibleChildren.some(c =>
    location.pathname === c.layout + c.path ||
    location.pathname.startsWith(c.layout + c.path + "/")
  );
  const [open, setOpen] = useState(groupActive);

  if (visibleChildren.length === 0) return null;

  return (
    <li style={{ listStyle: "none", margin: "1px 8px" }}>
      {/* group header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 14px", borderRadius: 10, cursor: "pointer",
          fontSize: 13,
          fontWeight: groupActive ? 700 : 500,
          color:      groupActive ? T.textActive : T.text,
          background: groupActive ? T.activeBg   : "transparent",
          borderLeft: `3px solid ${groupActive ? T.activeBorder : "transparent"}`,
          transition: "all .15s", userSelect: "none",
        }}
        onMouseEnter={e => { if (!groupActive) e.currentTarget.style.background = T.hoverBg; }}
        onMouseLeave={e => { if (!groupActive) e.currentTarget.style.background = groupActive ? T.activeBg : "transparent"; }}
      >
        <i className={prop.icon} style={{ width: 18, textAlign: "center", fontSize: 13, flexShrink: 0, color: groupActive ? T.textActive : T.textMuted }} />
        <span style={{ flex: 1 }}>{prop.name}</span>
        {/* chevron */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          style={{ flexShrink: 0, color: T.textMuted, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s" }}>
          <polyline points="3,2 7,5 3,8" />
        </svg>
      </div>

      {/* sub links */}
      <div style={{ overflow: "hidden", maxHeight: open ? `${visibleChildren.length * 46}px` : "0px", transition: "max-height .25s ease" }}>
        <ul style={{ listStyle: "none", margin: "3px 0 4px", padding: 0 }}>
          {visibleChildren.map((child, i) => {
            const childPath   = child.layout + child.path;
            const childActive = location.pathname === childPath || location.pathname.startsWith(childPath + "/");
            return (
              <li key={i} style={{ margin: "1px 0" }}>
                <RouterNavLink
                  to={childPath}
                  onClick={onChildClick}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "8px 14px 8px 44px", borderRadius: 8,
                    textDecoration: "none", fontSize: 12,
                    fontWeight: childActive ? 700 : 500,
                    color:      childActive ? T.textActive : T.text,
                    background: childActive ? T.subActiveBg : "transparent",
                    borderLeft: `3px solid ${childActive ? T.subBorder : "transparent"}`,
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => { if (!childActive) e.currentTarget.style.background = T.hoverBg; }}
                  onMouseLeave={e => { if (!childActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <i className={child.icon} style={{ width: 15, textAlign: "center", fontSize: 11, flexShrink: 0, color: childActive ? T.textActive : T.textMuted }} />
                  {child.name}
                </RouterNavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN SIDEBAR
══════════════════════════════════════════════════════════ */
const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const { roles: userRoles, user } = useAuth();

  const toggleCollapse = () => setCollapseOpen(v => !v);
  const closeCollapse  = () => setCollapseOpen(false);

  const { routes, logo } = props;

  let navbarBrandProps;
  if (logo?.innerLink)   navbarBrandProps = { to: logo.innerLink, tag: Link };
  else if (logo?.outterLink) navbarBrandProps = { href: logo.outterLink, target: "_blank" };

  /* filter to /admin layout, skip hidden, skip routes user can't see */
  const visibleRoutes = (routes || []).filter(r =>
    r.layout === "/admin" &&
    !r.hidden &&
    (r.children ? hasVisibleChildren(r, userRoles) : isVisible(r, userRoles))
  );

  return (
    <Navbar
      className="navbar-vertical fixed-left"
      expand="md"
      id="sidenav-main"
      style={{
        background: T.bg,
        borderRight: `1px solid ${T.border}`,
        boxShadow: "2px 0 20px rgba(0,0,0,.06)",
        padding: 0,
      }}
    >
      <Container fluid style={{ padding: 0, flexDirection: "column", alignItems: "stretch" }}>

        {/* ── Mobile toggler ── */}
        <button className="navbar-toggler" type="button" onClick={toggleCollapse}
          style={{ color: T.text, border: `1px solid ${T.border}`, margin: "12px 16px" }}>
          <span className="navbar-toggler-icon" />
        </button>

        {/* ── Logo / Brand ── */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          {logo ? (
            <NavbarBrand className="pt-0" {...navbarBrandProps} style={{ margin: 0, padding: 0 }}>
              <img alt={logo.imgAlt} src={logo.imgSrc} style={{ maxHeight: 38, objectFit: "contain" }} />
            </NavbarBrand>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#5e72e4,#825ee4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 10px rgba(94,114,228,.3)" }}>🔬</div>
              <div>
                <div style={{ color: "#32325d", fontWeight: 800, fontSize: 15 }}>LIMS</div>
                <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>Lab Info System</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Logged-in user info ── */}
        {user && (
          <div style={{ padding: "10px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, background: "#fafbff" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#5e72e4,#825ee4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#32325d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#5e72e4", textTransform: "capitalize", letterSpacing: .3 }}>
                🛡 {userRoles?.[0] || "user"}
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile user dropdown ── */}
        <Nav className="align-items-center d-md-none" style={{ padding: "8px 16px" }}>
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img alt="..." src={require("../../assets/img/theme/team-1-800x800.jpg")} />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Welcome!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" /> <span>My profile</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-settings-gear-65" /> <span>Settings</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem href="#pablo" onClick={e => e.preventDefault()}>
                <i className="ni ni-user-run" /> <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>

        {/* ── Collapsible nav ── */}
        <Collapse navbar isOpen={collapseOpen}>

          {/* mobile header */}
          <div className="navbar-collapse-header d-md-none" style={{ borderBottom: `1px solid ${T.border}`, padding: "12px 16px" }}>
            <Row>
              {logo && (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink
                    ? <Link to={logo.innerLink}><img alt={logo.imgAlt} src={logo.imgSrc} /></Link>
                    : <a href={logo.outterLink}><img alt={logo.imgAlt} src={logo.imgSrc} /></a>}
                </Col>
              )}
              <Col className="collapse-close" xs="6">
                <button className="navbar-toggler" type="button" onClick={toggleCollapse}><span /><span /></button>
              </Col>
            </Row>
          </div>

          {/* section label */}
          <div style={{ padding: "4px 22px 5px", fontSize: 9, fontWeight: 800, color: T.textMuted, letterSpacing: 1.8, textTransform: "uppercase" }}>
            Navigation
          </div>

          {/* ── nav items (role-filtered) ── */}
          <Nav navbar style={{padding: "14px 22px 5px"}}>
            <ul style={{ listStyle: "none", padding: "4px 0 12px", margin: 0, width: "100%" }}>
              {visibleRoutes.map((prop, idx) =>
                prop.children
                  ? <GroupLink  key={idx} prop={prop} userRoles={userRoles} onChildClick={closeCollapse} />
                  : <SingleLink key={idx} prop={prop} onClick={closeCollapse} />
              )}
            </ul>
          </Nav>

          <hr style={{ margin: "0 20px 12px", borderColor: T.border }} />

          {/* footer */}
          <div style={{ padding: "0 20px 20px", fontSize: 11, color: T.textMuted, textAlign: "center" }}>
            LIMS v1.0 · {new Date().getFullYear()}
          </div>

        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = { routes: [{}] };

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink:  PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc:     PropTypes.string.isRequired,
    imgAlt:     PropTypes.string.isRequired,
  }),
};

export default Sidebar;