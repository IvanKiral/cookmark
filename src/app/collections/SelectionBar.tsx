import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import styles from "./SelectionBar.module.css";
import { collectionStrings } from "./strings.ts";

type SelectionBarProps = {
  count: number;
  isAllSelected: boolean;
  canSelectAll: boolean;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onCancel: () => void;
  // "In Soups. Remove them, ..." or "Adding to Soups. ..."; none elsewhere.
  context?: string;
  actions: JSX.Element;
};

const strings = collectionStrings.select;

// Select mode: the header (a dark bar replacing the toolbar on desktop), the
// context line and the actions (a bar at the bottom of the screen on phones).
export const SelectionBar: Component<SelectionBarProps> = (props) => (
  <div class={styles.wrapper}>
    <div class={styles.bar}>
      <button
        type="button"
        class={styles.cancel}
        aria-label={strings.cancel}
        onClick={() => props.onCancel()}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          close
        </span>
      </button>
      <span class={styles.title} aria-live="polite">
        {props.count === 0 ? strings.none : strings.selected(props.count)}
      </span>
      <button
        type="button"
        class={styles.toggleAll}
        disabled={!props.canSelectAll}
        onClick={() => (props.isAllSelected ? props.onSelectNone() : props.onSelectAll())}
      >
        {props.isAllSelected ? strings.selectNone : strings.selectAll}
      </button>
      <div class={styles.actions}>{props.actions}</div>
    </div>
    <Show when={props.context}>
      <p class={styles.context}>
        <span class="material-symbols-outlined" aria-hidden="true">
          collections_bookmark
        </span>
        {props.context}
      </p>
    </Show>
  </div>
);
