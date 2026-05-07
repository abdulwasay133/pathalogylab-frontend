import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export default function ErrorDialoge({ open, handleClose, handleDelete }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: 0,
          minWidth: "380px",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Red accent top bar ── */}
      <div style={{
        height: 5,
        background: "linear-gradient(90deg,#f5365c,#f56036)",
      }} />

      <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* icon badge */}
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,#f5365c,#f56036)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22,
            boxShadow: "0 4px 12px rgba(245,54,92,.3)",
          }}>
            🗑️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#32325d" }}>
              Delete Confirmation
            </div>
            <div style={{ fontSize: 12, color: "#8898aa", marginTop: 2 }}>
              This action cannot be undone
            </div>
          </div>
        </div>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <div style={{
          background: "#fff8f8", border: "1px solid #fde8eb",
          borderRadius: 10, padding: "14px 16px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: 14, color: "#525f7f", lineHeight: 1.6 }}>
            Are you sure you want to delete this record?{" "}
            <strong style={{ color: "#f5365c" }}>This action is permanent</strong>{" "}
            and the data cannot be recovered.
          </p>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1 }}>
        <button
          onClick={handleClose}
          style={{
            borderRadius: 8, border: "1px solid #e0e6ed",
            background: "#f8f9fe", color: "#525f7f",
            fontWeight: 600, fontSize: 14,
            padding: "9px 24px", cursor: "pointer",
            flex: 1,
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          style={{
            borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#f5365c,#f56036)",
            color: "#fff", fontWeight: 600, fontSize: 14,
            padding: "9px 24px", cursor: "pointer",
            flex: 1,
            boxShadow: "0 4px 12px rgba(245,54,92,.35)",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
          }}
        >
          🗑️ Yes, Delete
        </button>
      </DialogActions>
    </Dialog>
  );
}