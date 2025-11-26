import { toast } from "react-toastify";

let lastToastTime = 0;
const TOAST_INTERVAL = 2000;

export const safeToastError = (msg) => {
  const now = Date.now();
  if (now - lastToastTime > TOAST_INTERVAL) {
    lastToastTime = now;
    toast.error(msg);
  }
};