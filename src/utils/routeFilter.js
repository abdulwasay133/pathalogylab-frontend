// src/utils/routeFilter.js
// ─────────────────────────────────────────────────────────
// Utility to get only the routes a user is allowed to render.
// Used in your Admin.js layout to build <Routes>.
// ─────────────────────────────────────────────────────────

/**
 * Flatten grouped routes (including children) into a single array.
 * Returns only routes that have a path (skips group headers).
 */
export function flattenRoutes(routes) {
  const flat = [];
  for (const route of routes) {
    if (route.children) {
      for (const child of route.children) {
        flat.push(child);
      }
    } else if (route.path) {
      flat.push(route);
    }
  }
  return flat;
}

/**
 * Filter routes by user roles.
 * Returns routes where the user has at least one matching role.
 */
export function filterByRoles(routes, userRoles = []) {
  return routes.filter(route => {
    if (!route.roles || route.roles.length === 0) return true;
    return route.roles.some(r => userRoles.includes(r));
  });
}