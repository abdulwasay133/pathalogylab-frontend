/**
 * LIMS design tokens — single source of truth for JS inline styles.
 * SCSS mirrors these via CSS custom properties in lims-professional.scss.
 */
const tokens = {
  colors: {
    primary: "#3b6cf4",
    primaryDark: "#2f5bd4",
    primaryLight: "#eef3ff",
    accent: "#0ea5e9",

    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#0ea5e9",

    text: "#1e293b",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",

    border: "#e2e8f0",
    borderLight: "#f1f5f9",

    bg: "#f1f5f9",
    surface: "#ffffff",
    surfaceHover: "#f8fafc",

    sidebarActive: "#eef3ff",
    sidebarActiveBorder: "#3b6cf4",
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },

  shadow: {
    sm: "0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)",
    md: "0 4px 16px rgba(15,23,42,.08)",
    lg: "0 12px 40px rgba(15,23,42,.12)",
    card: "0 2px 12px rgba(15,23,42,.06)",
  },

  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizeXs: 11,
    sizeSm: 13,
    sizeBase: 14,
    sizeLg: 16,
    sizeXl: 20,
  },

  gradient: {
    primary: "linear-gradient(135deg, #3b6cf4 0%, #6366f1 100%)",
    header: "linear-gradient(135deg, #1e40af 0%, #3b6cf4 50%, #6366f1 100%)",
    auth: "linear-gradient(145deg, #0f172a 0%, #1e3a8a 45%, #3b6cf4 100%)",
  },
};

export default tokens;
