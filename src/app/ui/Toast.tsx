import { Toast, toaster } from "@kobalte/core/toast";
import type { Component } from "solid-js";
import styles from "./Toast.module.css";

const TOAST_DURATION_MS = 2600;

// A new toast replaces the current one (Kobalte's `limit` would only queue it).
export const showToast = (message: string): void => {
  toaster.clear();
  toaster.show((props) => (
    <Toast toastId={props.toastId} class={styles.toast} duration={TOAST_DURATION_MS}>
      <span class={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
        check
      </span>
      <Toast.Description class={styles.message}>{message}</Toast.Description>
    </Toast>
  ));
};

// Mounted once at the root: where showToast renders.
export const ToastRegion: Component = () => (
  <Toast.Region duration={TOAST_DURATION_MS} limit={1}>
    <Toast.List class={styles.list} />
  </Toast.Region>
);
