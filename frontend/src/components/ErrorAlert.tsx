import { Show } from "solid-js";
import errorAlertStore from "@/hooks/errorAlertStore";

export const ErrorAlert = () => (
  <Show when={errorAlertStore.message}>
    <div
      class="error-alert"
      classList={{
        "error-alert-visible": errorAlertStore.visible,
      }}
      role="alert"
      aria-live="assertive"
    >
      {errorAlertStore.message}
    </div>
  </Show>
);
