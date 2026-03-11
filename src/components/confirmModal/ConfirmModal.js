import './ConfirmModal.css';

function ConfirmModal({ message, type = "success", onConfirm, onCancel }) {
  // Determine colors based on type
  const typeStyles = {
    success: {
      headerBg: "#16a34a", // green
      headerText: "white",
      btnClass: "confirm-btn-clear",
    },
    error: {
      headerBg: "#dc2626", // red
      headerText: "white",
      btnClass: "confirm-btn-clear-error",
    },
    warning: {
      headerBg: "#febc05", // red
      headerText: "white",
      btnClass: "confirm-btn-clear-warning",
    },
  };

  const styles = typeStyles[type] || typeStyles.success;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-modal">
        <div
          className="confirm-modal-header"
          style={{ background: styles.headerBg, color: styles.headerText }}
        >
          {type}
        </div>
        <div className="confirm-modal-body">{message}</div>
        <div className="confirm-modal-footer">
          <button onClick={onCancel} className="confirm-btn confirm-btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className={`confirm-btn ${styles.btnClass}`}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;