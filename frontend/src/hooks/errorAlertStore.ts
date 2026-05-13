import { createStore } from "solid-js/store";

const ALERT_DURATION_MS = 4000;

interface ErrorAlertState {
  message: string | null;
  visible: boolean;
}

const [errorAlertStore, setErrorAlertStore] = createStore<ErrorAlertState>({
  message: null,
  visible: false,
});

let hideTimer: number | undefined;
let clearTimer: number | undefined;

export const showErrorAlert = (message: string) => {
  const normalizedMessage = message?.trim() || "Something went wrong. Please try again.";

  if (hideTimer) {
    window.clearTimeout(hideTimer);
  }
  if (clearTimer) {
    window.clearTimeout(clearTimer);
  }

  setErrorAlertStore({
    message: normalizedMessage,
    visible: true,
  });

  hideTimer = window.setTimeout(() => {
    setErrorAlertStore("visible", false);

    clearTimer = window.setTimeout(() => {
      setErrorAlertStore("message", null);
    }, 300);
  }, ALERT_DURATION_MS);
};

export default errorAlertStore;
