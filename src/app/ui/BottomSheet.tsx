import { Dialog } from "@kobalte/core/dialog";
import type { JSX } from "@solidjs/web";
import { type ParentComponent, Show } from "solid-js";
import styles from "./BottomSheet.module.css";
import { createReturnFocus } from "./createReturnFocus.ts";

type BottomSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  // Small uppercase line above the title, e.g. "Recipe".
  kicker?: string;
  closeLabel: string;
  // Replaces the close button on the left, e.g. a back arrow.
  leading?: JSX.Element;
  subtitle?: string;
  footer?: JSX.Element;
};

// A modal sheet that slides up from the bottom of a phone screen. Built on
// Kobalte's dialog, which traps focus and closes on Escape or a click outside.
export const BottomSheet: ParentComponent<BottomSheetProps> = (props) => {
  createReturnFocus(() => props.isOpen);

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class={styles.overlay} />
        <Dialog.Content class={styles.sheet}>
          <div class={styles.handle} aria-hidden="true" />
          <div class={styles.header}>
            <Show when={props.leading}>{props.leading}</Show>
            <div class={styles.heading}>
              <Show when={props.kicker}>
                <span class={styles.kicker}>{props.kicker}</span>
              </Show>
              <Dialog.Title class={styles.title}>{props.title}</Dialog.Title>
              <Show when={props.subtitle}>
                <Dialog.Description class={styles.subtitle}>{props.subtitle}</Dialog.Description>
              </Show>
            </div>
            <Show when={!props.leading}>
              <Dialog.CloseButton class={styles.closeButton} aria-label={props.closeLabel}>
                <span class="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </Dialog.CloseButton>
            </Show>
          </div>
          <div class={styles.body}>{props.children}</div>
          <Show when={props.footer}>
            <div class={styles.footer}>{props.footer}</div>
          </Show>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
