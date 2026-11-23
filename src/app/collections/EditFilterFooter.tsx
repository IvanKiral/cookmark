import type { Component } from "solid-js";
import buttonStyles from "~/app/ui/button.module.css";
import styles from "./EditFilterFooter.module.css";
import { collectionStrings } from "./strings.ts";

type EditFilterFooterProps = {
  // "3 recipes match right now" (drawer) or "Preview: 3 recipes match" (panel).
  countLabel: string;
  canUpdate: boolean;
  onCancel: () => void;
  onUpdate: () => void;
};

// The footer of the filter drawer or panel while a smart filter is edited.
export const EditFilterFooter: Component<EditFilterFooterProps> = (props) => (
  <div class={styles.footer}>
    <span class={styles.count}>{props.countLabel}</span>
    <div class={styles.buttons}>
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.secondary}`}
        onClick={() => props.onCancel()}
      >
        {collectionStrings.smart.cancel}
      </button>
      <button
        type="button"
        class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.update}`}
        disabled={!props.canUpdate}
        onClick={() => props.onUpdate()}
      >
        {collectionStrings.smart.update}
      </button>
    </div>
  </div>
);
