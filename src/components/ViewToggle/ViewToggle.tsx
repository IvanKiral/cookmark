import type { Component } from "solid-js";
import { strings } from "~/constants/strings.ts";
import styles from "./ViewToggle.module.css";

export type ViewMode = "card" | "list";

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const ViewToggle: Component<ViewToggleProps> = (props) => (
  <div class={styles.toggle} role="group" aria-label={strings.recipeList.viewLabel}>
    <button
      type="button"
      class={styles.button}
      classList={{ [styles.active]: props.value === "card" }}
      aria-pressed={props.value === "card"}
      aria-label={strings.recipeList.cardView}
      onClick={() => props.onChange("card")}
    >
      <span class="material-symbols-outlined">grid_view</span>
    </button>
    <button
      type="button"
      class={styles.button}
      classList={{ [styles.active]: props.value === "list" }}
      aria-pressed={props.value === "list"}
      aria-label={strings.recipeList.listView}
      onClick={() => props.onChange("list")}
    >
      <span class="material-symbols-outlined">view_list</span>
    </button>
  </div>
);

export default ViewToggle;
