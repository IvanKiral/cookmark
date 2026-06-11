import Drawer from "@corvu/drawer";
import type { Component } from "solid-js";
import type { DifficultyFilter } from "~/constants/difficultyOptions.ts";
import { strings } from "~/constants/strings.ts";
import type { TagFilter } from "~/constants/tagOptions.ts";
import type { TimeFilter } from "~/constants/timeOptions.ts";
import FilterPanel from "../FilterPanel/FilterPanel.jsx";
import styles from "./FilterDrawer.module.css";

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  difficultyFilter: DifficultyFilter;
  timeFilter: TimeFilter;
  tagFilter: TagFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onTimeChange: (time: TimeFilter) => void;
  onTagChange: (tag: TagFilter) => void;
  onClearAll: () => void;
};

const FilterDrawer: Component<FilterDrawerProps> = (props) => {
  const hasAnyFilter = () =>
    props.difficultyFilter.length > 0 || props.timeFilter.length > 0 || props.tagFilter.length > 0;

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
              onDifficultyChange={props.onDifficultyChange}
              onTimeChange={props.onTimeChange}
              onTagChange={props.onTagChange}
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
