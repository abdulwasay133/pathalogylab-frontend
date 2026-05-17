import LimsFormModal from "components/modals/LimsFormModal";

const VARIANT_ICON = {
  info: "fa-solid fa-circle-info",
  success: "fa-solid fa-circle-check",
  warning: "fa-solid fa-triangle-exclamation",
  error: "fa-solid fa-circle-xmark",
};

/**
 * Legacy API: rendered when parent shows it (open implied).
 * Uses LimsFormModal with validation.
 */
function FormModal({ title, type = "info", fields = [], onSubmit, onCancel }) {
  return (
    <LimsFormModal
      open
      onClose={onCancel}
      title={title}
      subtitle="Fill in the details below"
      icon={VARIANT_ICON[type] || VARIANT_ICON.info}
      variant={type === "error" ? "error" : type === "success" ? "success" : type === "warning" ? "warning" : "info"}
      fields={fields}
      onSubmit={onSubmit}
      submitLabel="Save"
    />
  );
}

export default FormModal;
