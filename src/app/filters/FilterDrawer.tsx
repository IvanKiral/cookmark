import Drawer from "@corvu/drawer";
import type { Component } from "solid-js";
import buttonStyles from "~/app/ui/button.module.css";
import type { AuthorOption } from "./deriveAuthors.ts";
import styles from "./FilterDrawer.module.css";
import { FilterPanel } from "./FilterPanel.tsx";
import { countActiveFilters, type RecipeFilterKey, type RecipeFilters } from "./recipeFilters.ts";
import { filterStrings } from "./strings.ts";

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: RecipeFilters;
  authorOptions: ReadonlyArray<AuthorOption>;
  onFilterChange: <K extends RecipeFilterKey>(key: K, values: RecipeFilters[K]) => void;
  onClearAll: () => void;
  // Recipes matching the current search and filters, shown on the close button.
  resultCount: number;
};

export const FilterDrawer: Component<FilterDrawerProps> = (props) => {
  const hasAnyFilter = (): boolean => countActiveFilters(props.filters) > 0;

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange} side="left">
      <Drawer.Portal>
        <Drawer.Overlay class={styles.overlay} aria-hidden="true" />
        <Drawer.Content
          class={styles.content}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-drawer-title"
        >
          <div class={styles.header}>
            <h2 id="filter-drawer-title" class={styles.title}>
              {filterStrings.drawer.title}
            </h2>
            <Drawer.Close class={styles.closeButton} aria-label={filterStrings.closeDrawer}>
              <span class="material-symbols-outlined">close</span>
            </Drawer.Close>
          </div>

          <div class={styles.sections}>
            <FilterPanel
              variant="drawer"
              filters={props.filters}
              authorOptions={props.authorOptions}
              onFilterChange={props.onFilterChange}
            />
          </div>

          {/* Always visible, so the result count updates while filtering and
              there's an obvious way back to the recipes. */}
          <div class={styles.footer}>
            {hasAnyFilter() && (
              <button
                type="button"
                class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                onClick={props.onClearAll}
              >
                {filterStrings.drawer.clearAll}
              </button>
            )}
            <button
              type="button"
              class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.showButton}`}
              onClick={() => props.onOpenChange(false)}
            >
              {filterStrings.drawer.showResults(props.resultCount)}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};
