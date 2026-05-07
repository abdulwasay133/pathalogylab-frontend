/* No external CSS needed — all styles are inline, consistent with app design system */

const TYPE_CONFIG = {
  success: {
    gradient: "linear-gradient(135deg,#2dce89,#2dcecc)",
    shadow:   "rgba(45,206,137,.3)",
    bg:       "#f0faf5",
    border:   "#b7ebd9",
    color:    "#1aae6f",
    icon:     "✅",
    label:    "Success",
  },
  error: {
    gradient: "linear-gradient(135deg,#f5365c,#f56036)",
    shadow:   "rgba(245,54,92,.3)",
    bg:       "#fff8f8",
    border:   "#fde8eb",
    color:    "#f5365c",
    icon:     "🗑️",
    label:    "Error",
  },
  warning: {
    gradient: "linear-gradient(135deg,#fb6340,#fbb140)",
    shadow:   "rgba(251,99,64,.3)",
    bg:       "#fff8f0",
    border:   "#ffd4c0",
    color:    "#fb6340",
    icon:     "⚠️",
    label:    "Warning",
  },
};

export default function ConfirmModal({
  message,
  type = "success",
  onConfirm,
  onCancel,
}) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.success;

  return (
    /* ── backdrop ── */
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(3px)",
      animation: "fadeIn .15s ease",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        minWidth: 360, maxWidth: 440, width: "90%",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        animation: "slideUp .2s ease",
      }}>

        {/* ── gradient accent bar ── */}
        <div style={{ height: 5, background: cfg.gradient }} />

        {/* ── header ── */}
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: cfg.gradient,
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22,
              boxShadow: `0 4px 12px ${cfg.shadow}`,
            }}>
              {cfg.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#32325d", textTransform: "capitalize" }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: 12, color: "#8898aa", marginTop: 2 }}>
                Please confirm to proceed
              </div>
            </div>
          </div>
        </div>

        {/* ── message body ── */}
        <div style={{ padding: "16px 24px" }}>
          <div style={{
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 10, padding: "14px 16px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
              {cfg.icon}
            </span>
            <p style={{
              margin: 0, fontSize: 14,
              color: "#525f7f", lineHeight: 1.6,
            }}>
              {message}
            </p>
          </div>
        </div>

        {/* ── footer ── */}
        <div style={{
          padding: "0 24px 24px",
          display: "flex", gap: 10,
          borderTop: "1px solid #f0f0f0",
          paddingTop: 16,
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, borderRadius: 8,
              border: "1px solid #e0e6ed",
              background: "#f8f9fe", color: "#525f7f",
              fontWeight: 600, fontSize: 14,
              padding: "10px 0", cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={e => e.target.style.background = "#eef0f8"}
            onMouseLeave={e => e.target.style.background = "#f8f9fe"}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1, borderRadius: 8, border: "none",
              background: cfg.gradient, color: "#fff",
              fontWeight: 600, fontSize: 14,
              padding: "10px 0", cursor: "pointer",
              boxShadow: `0 4px 12px ${cfg.shadow}`,
              transition: "opacity .15s",
            }}
            onMouseEnter={e => e.target.style.opacity = "0.88"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          >
            ✓ Confirm
          </button>
        </div>

      </div>

      {/* ── keyframe animations ── */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}