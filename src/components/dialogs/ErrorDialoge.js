import { useEffect, useRef } from "react";
import { confirmDelete } from "utils/alert";

/**
 * Delete confirmation via SweetAlert2.
 * Keeps the same props API for existing pages.
 */
export default function ErrorDialoge({
  open,
  handleClose,
  handleDelete,
  title = "Delete confirmation",
  text = "Are you sure you want to delete this record? This action cannot be undone.",
}) {
  const shown = useRef(false);

  useEffect(() => {
    if (!open) {
      shown.current = false;
      return;
    }
    if (shown.current) return;
    shown.current = true;

    (async () => {
      const result = await confirmDelete({ title, text });
      handleClose?.();
      if (result.isConfirmed) handleDelete?.();
    })();
  }, [open, title, text, handleClose, handleDelete]);

  return null;
}
