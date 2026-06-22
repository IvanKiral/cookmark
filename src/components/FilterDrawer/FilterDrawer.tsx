import Drawer from "@corvu/drawer";
import type { Component } from "solid-js";
import type { DifficultyFilter } from "~/constants/difficultyOptions.ts";
import { strings } from "~/constants/strings.ts";
import type { TagFilter } from "~/constants/tagOptions.ts";
import type { TimeFilter } from "~/constants/timeOptions.ts";
import type { AuthorOption } from "~/utils/deriveAuthors.ts";
import FilterPanel from "../FilterPanel/FilterPanel.jsx";
import styles from "./FilterDrawer.module.css";

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  difficultyFilter: DifficultyFilter;
  timeFilter: TimeFilter;
  tagFilter: TagFilter;
  authorFilter: ReadonlyArray<string>;
  authorOptions: ReadonlyArray<AuthorOption>;
  favoritesOnly: boolean;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onTimeChange: (time: TimeFilter) => void;
  onTagChange: (tag: TagFilter) => void;
  onAuthorChange: (author: ReadonlyArray<string>) => void;
  onFavoritesOnlyChange: (enabled: boolean) => void;
  onClearAll: () => void;
};

const FilterDrawer: Component<FilterDrawerProps> = (props) => {
  const hasAnyFilter = () =>
    props.difficultyFilter.length > 0 ||
    props.timeFilter.length > 0 ||
    props.tagFilter.length > 0 ||
    props.authorFilter.length > 0 ||
    props.favoritesOnly;

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
              {strings.filterDrawer.title}
            </h2>
            <Drawer.Close class={styles.closeButton} aria-label="Close filters">
              <span class="material-symbols-outlined">close</span>
            </Drawer.Close>
          </div>

          <div class={styles.sections}>
            <FilterPanel
              difficultyFilter={props.difficultyFilter}
              timeFilter={props.timeFilter}
              tagFilter={props.tagFilter}
              authorFilter={props.authorFilter}
              authorOptions={props.authorOptions}
              favoritesOnly={props.favoritesOnly}
              onDifficultyChange={props.onDifficultyChange}
              onTimeChange={props.onTimeChange}
              onTagChange={props.onTagChange}
              onAuthorChange={props.onAuthorChange}
              onFavoritesOnlyChange={props.onFavoritesOnlyChange}
            />
          </div>

          {hasAnyFilter() && (
            <div class={styles.footer}>
              <button type="button" class={styles.clearButton} onClick={props.onClearAll}>
                {strings.filterDrawer.clearAll}
              </button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};

export default FilterDrawer;
