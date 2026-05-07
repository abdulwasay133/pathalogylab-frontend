import { useForm } from "react-hook-form";

/* ── type config ── */
const TYPE_CONFIG = {
  info: {
    gradient: "linear-gradient(135deg,#11cdef,#1171ef)",
    shadow:   "rgba(17,193,239,.3)",
    icon:     "📋",
  },
  success: {
    gradient: "linear-gradient(135deg,#2dce89,#2dcecc)",
    shadow:   "rgba(45,206,137,.3)",
    icon:     "✅",
  },
  warning: {
    gradient: "linear-gradient(135deg,#fb6340,#fbb140)",
    shadow:   "rgba(251,99,64,.3)",
    icon:     "⚠️",
  },
  error: {
    gradient: "linear-gradient(135deg,#f5365c,#f56036)",
    shadow:   "rgba(245,54,92,.3)",
    icon:     "❌",
  },
};

/* ── shared input style ── */
const iS = {
  borderRadius: 8, border: "1px solid #e0e6ed",
  padding: "10px 13px", fontSize: 14, color: "#32325d",
  background: "#fff", width: "100%", outline: "none",
  transition: "border .15s, box-shadow .15s",
  boxSizing: "border-box",
};
const iErr  = { border: "1px solid #f5365c" };
const iFocus = (e) => {
  e.target.style.border = "1px solid #5e72e4";
  e.target.style.boxShadow = "0 0 0 3px rgba(94,114,228,.1)";
};
const iBlur = (e) => {
  e.target.style.border = "1px solid #e0e6ed";
  e.target.style.boxShadow = "none";
};

/* ══════════════════════════════════════════════════════════ */

function FormModal({ title, type = "info", fields = [], onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

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
        minWidth: 380, maxWidth: 480, width: "90%",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        animation: "slideUp .2s ease",
      }}>

        {/* ── gradient top bar ── */}
        <div style={{ height: 5, background: cfg.gradient }} />

        {/* ── header ── */}
        <div style={{
          padding: "20px 24px 0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: cfg.gradient,
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20,
            boxShadow: `0 4px 12px ${cfg.shadow}`,
          }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#32325d" }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: "#8898aa", marginTop: 2 }}>
              Fill in the details below
            </div>
          </div>

          {/* close × */}
          <button
            type="button"
            onClick={onCancel}
            style={{
              marginLeft: "auto", background: "#f8f9fe",
              border: "1px solid #e0e6ed", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, color: "#8898aa",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── form body ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ padding: "20px 24px 4px" }}>
            {fields.map((field, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <label style={{
                  fontSize: 13, fontWeight: 600,
                  color: "#525f7f", marginBottom: 6, display: "block",
                }}>
                  {field.label}{" "}
                  <span style={{ color: "#f5365c" }}>*</span>
                </label>

                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder || ""}
                  style={errors[field.name] ? { ...iS, ...iErr } : iS}
                  onFocus={iFocus}
                  onBlur={iBlur}
                  {...register(field.name, {
                    required: `${field.label} is required`,
                    ...(field.type === "number" && {
                      valueAsNumber: true,
                      min: { value: 0, message: `${field.label} must be 0 or more` },
                    }),
                  })}
                />

                {errors[field.name] && (
                  <small style={{
                    color: "#f5365c", fontSize: 11,
                    marginTop: 4, display: "block",
                  }}>
                    ⚠ {errors[field.name].message}
                  </small>
                )}
              </div>
            ))}
          </div>

          {/* ── footer ── */}
          <div style={{
            padding: "12px 24px 24px",
            display: "flex", gap: 10,
            borderTop: "1px solid #f0f0f0",
            paddingTop: 16,
          }}>
            <button
              type="button"
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
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1, borderRadius: 8, border: "none",
                background: cfg.gradient, color: "#fff",
                fontWeight: 600, fontSize: 14,
                padding: "10px 0", cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: `0 4px 12px ${cfg.shadow}`,
                opacity: isSubmitting ? 0.7 : 1,
                transition: "opacity .15s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6,
              }}
            >
              {isSubmitting ? (
                <><span className="spinner-border spinner-border-sm" /> Saving…</>
              ) : (
                "💾 Save"
              )}
            </button>
          </div>
        </form>

      </div>

      {/* animations */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

export default FormModal;