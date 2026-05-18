/**
 * LIMS design tokens — medical green palette.
 * SCSS mirrors these via CSS custom properties in lims-professional.scss.
 */
const tokens = {
  colors: {
    primary: "#0d9488",
    primaryDark: "#0f766e",
    primaryLight: "#ecfdf5",
    accent: "#14b8a6",

    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#0ea5e9",

    text: "#134e4a",
    textSecondary: "#5f7a76",
    textMuted: "#94a8a4",

    border: "#d1e7e4",
    borderLight: "#ecf5f3",

    bg: "#f4faf8",
    surface: "#ffffff",
    surfaceHover: "#f0fdf9",

    sidebarActive: "#ecfdf5",
    sidebarActiveBorder: "#0d9488",
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },

  shadow: {
    sm: "0 1px 3px rgba(15, 60, 50, .06), 0 1px 2px rgba(15, 60, 50, .04)",
    md: "0 4px 16px rgba(15, 60, 50, .08)",
    lg: "0 12px 40px rgba(15, 60, 50, .12)",
    card: "0 2px 12px rgba(15, 60, 50, .06)",
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
    primary: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
    header: "linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #14b8a6 100%)",
    auth: "linear-gradient(145deg, #042f2e 0%, #0f766e 45%, #14b8a6 100%)",
  },
};

export default tokens;
