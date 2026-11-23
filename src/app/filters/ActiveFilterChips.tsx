import type { JSX } from "@solidjs/web";
import { type Component, For } from "solid-js";
import styles from "./ActiveFilterChips.module.css";
import { listActiveFilters } from "./activeFilters.ts";
import type { RecipeFilterKey, RecipeFilters } from "./recipeFilters.ts";
import { filterStrings } from "./strings.ts";

type ActiveFilterChipsProps = {
  filters: RecipeFilters;
  onRemove: (key: RecipeFilterKey, value: string) => void;
  onClearAll: () => void;
  // Right-aligned, e.g. "Save as smart filter".
  trailing?: JSX.Element;
};

// Desktop, filters panel closed: each active option as a removable chip.
export const ActiveFilterChips: Component<ActiveFilterChipsProps> = (props) => (
  <div class={styles.row}>
    <For each={listActiveFilters(props.filters)}>
      {(filter) => (
        <button
          type="button"
          class={styles.chip}
          aria-label={filterStrings.removeFilter(filter.label)}
          onClick={() => props.onRemove(filter.key, filter.value)}
        >
          <span>{filter.label}</span>
          <span class="material-symbols-outlined" aria-hidden="true">
            close
          </span>
        </button>
      )}
    </For>
    <button type="button" class={styles.clear} onClick={() => props.onClearAll()}>
      {filterStrings.drawer.clearAll}
    </button>
    <span class={styles.trailing}>{props.trailing}</span>
  </div>
);
