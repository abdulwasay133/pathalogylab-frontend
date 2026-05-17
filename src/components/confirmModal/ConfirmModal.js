import { useEffect, useRef } from "react";
import { confirmAction } from "utils/alert";

/**
 * Confirmation dialog via SweetAlert2 (replaces inline modal).
 */
export default function ConfirmModal({
  message,
  type = "warning",
  onConfirm,
  onCancel,
  title,
}) {
  const shown = useRef(false);

  useEffect(() => {
    if (!message) return;
    if (shown.current) return;
    shown.current = true;

    const iconMap = { success: "success", error: "error", warning: "warning" };

    (async () => {
      const result = await confirmAction({
        title: title || (type === "error" ? "Confirm" : "Please confirm"),
        text: message,
        type: iconMap[type] || "question",
        confirmText: "Confirm",
      });
      shown.current = false;
      if (result.isConfirmed) onConfirm?.();
      else onCancel?.();
    })();
  }, [message, type, title, onConfirm, onCancel]);

  return null;
}
