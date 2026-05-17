import { useEffect } from "react";
import { getVariant } from "theme/pageVariants";
import "./LimsModal.css";

const VARIANT_MAP = {
  primary: "primary",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  doctor: "doctor",
  commission: "commission",
};

export default function LimsModal({
  open,
  onClose,
  title,
  subtitle,
  icon = "fa-solid fa-circle-info",
  variant = "primary",
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const v = getVariant(VARIANT_MAP[variant] || "primary");

  return (
    <div
      className="lims-modal-backdrop"
      role="presentation"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`lims-modal lims-modal--${size}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lims-modal-accent" style={{ background: v.gradient }} />

        <div className="lims-modal-header">
          <div className="lims-modal-header-main">
            <span className="lims-modal-icon" style={{ background: v.gradient }}>
              <i className={`${icon} text-white`} />
            </span>
            <div>
              <h2 className="lims-modal-title">{title}</h2>
              {subtitle && <p className="lims-modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button type="button" className="lims-modal-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="lims-modal-body">{children}</div>

        {footer && <div className="lims-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function LimsModalFooter({
  onCancel,
  onConfirm,
  cancelLabel = "Cancel",
  confirmLabel = "Save",
  saving = false,
  confirmVariant = "primary",
  disableConfirm = false,
  confirmType = "button",
  formId,
}) {
  const confirmClass =
    confirmVariant === "danger"
      ? "lims-modal-btn lims-modal-btn--danger"
      : "lims-modal-btn lims-modal-btn--primary";

  return (
    <>
      <button type="button" className="lims-modal-btn lims-modal-btn--ghost" onClick={onCancel} disabled={saving}>
        {cancelLabel}
      </button>
      <button
        type={confirmType}
        form={formId}
        className={confirmClass}
        onClick={confirmType === "button" ? onConfirm : undefined}
        disabled={saving || disableConfirm}
      >
        {saving ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" /> Saving…
          </>
        ) : (
          confirmLabel
        )}
      </button>
    </>
  );
}
