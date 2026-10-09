import { Dialog } from "@ark-ui/solid/dialog";
import type { Component } from "solid-js";
import { Portal } from "solid-js/web";
import { strings } from "~/constants/strings.ts";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Escape, a click on the backdrop and the Cancel button all cancel. Cancel is
// the first button, so it gets the initial focus and Enter doesn't confirm.
const ConfirmDialog: Component<ConfirmDialogProps> = (props) => (
  <Dialog.Root
    role="alertdialog"
    open={props.isOpen}
    onOpenChange={(details) => {
      if (!details.open) {
        props.onCancel();
      }
    }}
    lazyMount
    unmountOnExit
  >
    <Portal>
      <Dialog.Backdrop class={styles.backdrop} />
      <Dialog.Positioner class={styles.positioner}>
        <Dialog.Content class={styles.content}>
          <Dialog.Title class={styles.title}>{props.title}</Dialog.Title>
          <Dialog.Description class={styles.description}>{props.description}</Dialog.Description>
          <div class={styles.actions}>
            <Dialog.CloseTrigger class={styles.cancelButton}>
              {strings.confirmDialog.cancel}
            </Dialog.CloseTrigger>
            <button type="button" class={styles.confirmButton} onClick={() => props.onConfirm()}>
              {props.confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);

export default ConfirmDialog;
