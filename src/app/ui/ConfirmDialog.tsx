import { AlertDialog } from "@kobalte/core/alert-dialog";
import type { Component } from "solid-js";
import buttonStyles from "./button.module.css";
import styles from "./ConfirmDialog.module.css";
import { createReturnFocus } from "./createReturnFocus.ts";
import { uiStrings } from "./strings.ts";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Escape, a click outside the dialog and the Cancel button all cancel. Cancel
// is the first button, so it gets the initial focus and Enter doesn't confirm.
export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
  createReturnFocus(() => props.isOpen);

  return (
    <AlertDialog
      open={props.isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          props.onCancel();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay class={styles.backdrop} />
        <div class={styles.positioner}>
          <AlertDialog.Content class={styles.content}>
            <AlertDialog.Title class={styles.title}>{props.title}</AlertDialog.Title>
            <AlertDialog.Description class={styles.description}>
              {props.description}
            </AlertDialog.Description>
            <div class={styles.actions}>
              <button
                type="button"
                class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                onClick={() => props.onCancel()}
              >
                {props.cancelLabel ?? uiStrings.cancel}
              </button>
              <button
                type="button"
                class={`${buttonStyles.button} ${buttonStyles.primary}`}
                onClick={() => props.onConfirm()}
              >
                {props.confirmLabel}
              </button>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};
