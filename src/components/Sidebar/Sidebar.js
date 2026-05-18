import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { ChevronRight, FlaskConical, X } from "lucide-react";
import { useAuth } from "context/AuthContext";
import { getNavIcon } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const isVisible = (route, userRoles) => {
  if (!route.roles || route.roles.length === 0) return true;
  return route.roles.some((r) => userRoles.includes(r));
};

const hasVisibleChildren = (route, userRoles) =>
  (route.children || []).some((child) => isVisible(child, userRoles));

function isPathActive(pathname, fullPath, end = false) {
  if (end) return pathname === fullPath || pathname === fullPath + "/";
  return pathname === fullPath || pathname.startsWith(fullPath + "/");
}

function NavItemLink({ to, icon: Icon, label, onNavigate, end = false, isChild = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "lims-nav-link",
          isActive && "lims-nav-link--active",
          isChild && "lims-nav-link--child"
        )
      }
    >
      <Icon className="lims-nav-icon h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function NavGroup({ route, userRoles, onNavigate }) {
  const location = useLocation();
  const visibleChildren = (route.children || []).filter((c) =>
    isVisible(c, userRoles)
  );
  const groupActive = visibleChildren.some((c) => {
    const p = c.layout + c.path;
    return isPathActive(location.pathname, p);
  });
  const [open, setOpen] = useState(groupActive);
  const Icon = getNavIcon(route);

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  if (visibleChildren.length === 0) return null;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn("lims-nav-group-btn", groupActive && "lims-nav-group-btn--active")}
      >
        <Icon className="lims-nav-icon h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">{route.name}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 opacity-60 transition-transform",
            open && "rotate-90"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="lims-nav-sublist space-y-0.5">
          {visibleChildren.map((child) => {
            const IconChild = getNavIcon(child);
            return (
              <li key={child.path}>
                <NavItemLink
                  to={child.layout + child.path}
                  icon={IconChild}
                  label={child.name}
                  onNavigate={onNavigate}
                  isChild
                />
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

const Sidebar = ({ routes, logo, mobileOpen, onMobileClose }) => {
  const { roles: userRoles } = useAuth();
  const location = useLocation();

  const visibleRoutes = (routes || []).filter(
    (r) =>
      r.layout === "/admin" &&
      !r.hidden &&
      (r.children ? hasVisibleChildren(r, userRoles) : isVisible(r, userRoles))
  );

  useEffect(() => {
    onMobileClose?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const brandLink = logo?.innerLink || "/admin/index";

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar"
          onClick={onMobileClose}
        />
      )}

      <aside
        id="sidenav-main"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card shadow-xl transition-transform duration-200 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <Link to={brandLink} className="flex min-w-0 items-center gap-3" onClick={onMobileClose}>
            {logo?.imgSrc ? (
              <img
                src={logo.imgSrc}
                alt={logo.imgAlt || "PrimeLIMS"}
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                    color: "#fff",
                  }}
                >
                  <FlaskConical className="h-5 w-5" aria-hidden />
                </span>
                <span className="truncate text-base font-bold text-foreground">PrimeLIMS</span>
              </>
            )}
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent md:hidden"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Navigation
          </p>
          <ul className="space-y-1">
            {visibleRoutes.map((route, idx) =>
              route.children ? (
                <NavGroup
                  key={route.name || idx}
                  route={route}
                  userRoles={userRoles}
                  onNavigate={onMobileClose}
                />
              ) : (
                <li key={route.path || idx}>
                  <NavItemLink
                    to={route.layout + route.path}
                    icon={getNavIcon(route)}
                    label={route.name}
                    onNavigate={onMobileClose}
                    end={route.path === "/index"}
                  />
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              PrimeLIMS v1.0 · {new Date().getFullYear()}
            </p>
            {userRoles?.[0] && (
              <Badge
                variant="secondary"
                className="shrink-0 border-emerald-200 bg-emerald-50 text-[10px] capitalize text-emerald-800"
              >
                {userRoles[0]}
              </Badge>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string,
    imgAlt: PropTypes.string,
  }),
  mobileOpen: PropTypes.bool,
  onMobileClose: PropTypes.func,
};

export default Sidebar;
