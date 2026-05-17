/**
 * SweetAlert2-backed toast API (drop-in for react-toastify).
 */
import alert from "./alert";

export const toast = {
  success: (message) => alert.success(message),
  error: (message) => alert.error(message),
  warning: (message) => alert.warning(message),
  info: (message) => alert.info(message),
};

export default toast;
