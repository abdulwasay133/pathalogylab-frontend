import T from "./tokens";

export const inputStyle = {
  borderRadius: T.radius.md,
  border: `1px solid ${T.colors.border}`,
  padding: "10px 13px",
  fontSize: T.font.sizeBase,
  color: T.colors.text,
  background: T.colors.surface,
  width: "100%",
  outline: "none",
  transition: "border .15s, box-shadow .15s",
  boxSizing: "border-box",
};

export const inputErrorStyle = { border: `1px solid ${T.colors.danger}` };

export const onInputFocus = (e) => {
  e.target.style.border = `1px solid ${T.colors.primary}`;
  e.target.style.boxShadow = "0 0 0 3px rgba(59,108,244,.12)";
};

export const onInputBlur = (e) => {
  e.target.style.border = `1px solid ${T.colors.border}`;
  e.target.style.boxShadow = "none";
};

export const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: T.colors.textSecondary,
  marginBottom: 6,
  display: "block",
  letterSpacing: "0.02em",
};

export const btnPrimary = {
  borderRadius: T.radius.md,
  fontWeight: 600,
  fontSize: 14,
  padding: "10px 24px",
  border: "none",
  background: T.gradient.primary,
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(59,108,244,.35)",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

export const btnSecondary = {
  borderRadius: T.radius.md,
  fontWeight: 600,
  fontSize: 14,
  padding: "10px 20px",
  cursor: "pointer",
  background: T.colors.surface,
  border: `1px solid ${T.colors.border}`,
  color: T.colors.textSecondary,
};

export const btnGhost = {
  ...btnSecondary,
  background: "#f8fafc",
  fontSize: 13,
  padding: "8px 16px",
};

export const statusBadge = (active) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 12px",
  borderRadius: T.radius.pill,
  fontSize: 12,
  fontWeight: 600,
  background: active ? "#ecfdf5" : "#fef2f2",
  color: active ? "#059669" : T.colors.danger,
  border: `1px solid ${active ? "#a7f3d0" : "#fecaca"}`,
});

export const statusDot = (active) => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0,
  background: active ? T.colors.success : T.colors.danger,
});
