import type { Component } from "solid-js";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import { recipeListStrings } from "./strings.ts";
import styles from "./ViewToggle.module.css";

export type ViewMode = "card" | "list";

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export const ViewToggle: Component<ViewToggleProps> = (props) => (
  <div class={styles.toggle} role="group" aria-label={recipeListStrings.viewLabel}>
    <button
      type="button"
      class={[styles.button, { [styles.active]: props.value === "card" }]}
      aria-pressed={ariaBoolean(props.value === "card")}
      aria-label={recipeListStrings.cardView}
      onClick={() => props.onChange("card")}
    >
      <span class="material-symbols-outlined">grid_view</span>
    </button>
    <button
      type="button"
      class={[styles.button, { [styles.active]: props.value === "list" }]}
      aria-pressed={ariaBoolean(props.value === "list")}
      aria-label={recipeListStrings.listView}
      onClick={() => props.onChange("list")}
    >
      <span class="material-symbols-outlined">view_list</span>
    </button>
  </div>
);
