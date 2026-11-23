import type { Component } from "solid-js";
import styles from "./SaveSmartFilterButton.module.css";
import { collectionStrings } from "./strings.ts";

// Opens the save dialog for the active filters (drawer footer, active filter row).
export const SaveSmartFilterButton: Component<{ onClick: () => void }> = (props) => (
  <button type="button" class={styles.button} onClick={() => props.onClick()}>
    <span class="material-symbols-outlined" aria-hidden="true">
      collections_bookmark
    </span>
    {collectionStrings.smart.saveButton}
  </button>
);
