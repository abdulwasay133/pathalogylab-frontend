import T from "./tokens";

/** Icon badge gradients per page type */
export const PAGE_VARIANTS = {
  primary:   { gradient: T.gradient.primary, badgeBg: "#eef3ff", badgeColor: T.colors.primary, badgeBorder: "#c7d7fe" },
  success:   { gradient: "linear-gradient(135deg, #059669, #10b981)", badgeBg: "#ecfdf5", badgeColor: "#059669", badgeBorder: "#a7f3d0" },
  warning:   { gradient: "linear-gradient(135deg, #d97706, #f59e0b)", badgeBg: "#fffbeb", badgeColor: "#b45309", badgeBorder: "#fde68a" },
  info:      { gradient: "linear-gradient(135deg, #0284c7, #0ea5e9)", badgeBg: "#eff6ff", badgeColor: "#1d4ed8", badgeBorder: "#bfdbfe" },
  doctor:    { gradient: "linear-gradient(135deg, #0d9488, #14b8a6)", badgeBg: "#f0fdfa", badgeColor: "#0f766e", badgeBorder: "#99f6e4" },
  commission:{ gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)", badgeBg: "#f5f3ff", badgeColor: "#6d28d9", badgeBorder: "#ddd6fe" },
  patient:   { gradient: "linear-gradient(135deg, #2563eb, #3b82f6)", badgeBg: "#eff6ff", badgeColor: "#1d4ed8", badgeBorder: "#bfdbfe" },
  settings:  { gradient: T.gradient.primary, badgeBg: "#f1f5f9", badgeColor: T.colors.textSecondary, badgeBorder: T.colors.border },
  template:  { gradient: "linear-gradient(135deg, #1e40af, #6366f1)", badgeBg: "#eef2ff", badgeColor: "#4338ca", badgeBorder: "#c7d2fe" },
};

export const getVariant = (key) => PAGE_VARIANTS[key] || PAGE_VARIANTS.primary;
