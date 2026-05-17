import Swal from "sweetalert2";

const LIMS_COLORS = {
  primary: "#3b6cf4",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#0ea5e9",
};

const basePopup = {
  customClass: {
    popup: "lims-swal-popup",
    title: "lims-swal-title",
    htmlContainer: "lims-swal-text",
    confirmButton: "lims-swal-btn lims-swal-btn-confirm",
    cancelButton: "lims-swal-btn lims-swal-btn-cancel",
    denyButton: "lims-swal-btn lims-swal-btn-deny",
  },
  buttonsStyling: false,
  confirmButtonText: "OK",
  heightAuto: false,
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
  ...basePopup,
});

export function showSuccess(message, title = "Success") {
  return Toast.fire({ icon: "success", title, text: message });
}

export function showError(message, title = "Error") {
  return Toast.fire({ icon: "error", title, text: message });
}

export function showWarning(message, title = "Warning") {
  return Toast.fire({ icon: "warning", title, text: message });
}

export function showInfo(message, title = "Info") {
  return Toast.fire({ icon: "info", title, text: message });
}

export async function confirmDelete({
  title = "Delete confirmation",
  text = "Are you sure you want to delete this record? This action cannot be undone.",
  confirmText = "Yes, delete",
  cancelText = "Cancel",
} = {}) {
  return Swal.fire({
    ...basePopup,
    icon: "warning",
    iconColor: LIMS_COLORS.error,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      ...basePopup.customClass,
      confirmButton: "lims-swal-btn lims-swal-btn-danger",
    },
  });
}

export async function confirmAction({
  title = "Confirm",
  text = "Are you sure you want to continue?",
  type = "question",
  confirmText = "Yes, continue",
  cancelText = "Cancel",
} = {}) {
  return Swal.fire({
    ...basePopup,
    icon: type,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
  });
}

/** Drop-in helpers (replaces react-toastify calls) */
export const alert = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  confirmDelete,
  confirmAction,
  fire: Swal.fire,
};

export default alert;
