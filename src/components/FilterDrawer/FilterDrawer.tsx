import Drawer from "@corvu/drawer";
import type { Component } from "solid-js";
import type { DifficultyFilter } from "~/constants/difficultyOptions.ts";
import type { MarkFilter } from "~/constants/markOptions.ts";
import type { RecommendedFilter } from "~/constants/recommendedOptions.ts";
import { strings } from "~/constants/strings.ts";
import type { TagFilter } from "~/constants/tagOptions.ts";
import type { TimeFilter } from "~/constants/timeOptions.ts";
import buttonStyles from "~/styles/button.module.css";
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
  markFilter: MarkFilter;
  recommendedFilter: RecommendedFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onTimeChange: (time: TimeFilter) => void;
  onTagChange: (tag: TagFilter) => void;
  onAuthorChange: (author: ReadonlyArray<string>) => void;
  onMarkChange: (marks: MarkFilter) => void;
  onRecommendedChange: (recommended: RecommendedFilter) => void;
  onClearAll: () => void;
  // Recipes matching the current search and filters, shown on the close button.
  resultCount: number;
};

const FilterDrawer: Component<FilterDrawerProps> = (props) => {
  const hasAnyFilter = () =>
    props.difficultyFilter.length > 0 ||
    props.timeFilter.length > 0 ||
    props.tagFilter.length > 0 ||
    props.authorFilter.length > 0 ||
    props.markFilter.length > 0 ||
    props.recommendedFilter.length > 0;

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
              layout="chips"
              difficultyFilter={props.difficultyFilter}
              timeFilter={props.timeFilter}
              tagFilter={props.tagFilter}
              authorFilter={props.authorFilter}
              authorOptions={props.authorOptions}
              markFilter={props.markFilter}
              recommendedFilter={props.recommendedFilter}
              onDifficultyChange={props.onDifficultyChange}
              onTimeChange={props.onTimeChange}
              onTagChange={props.onTagChange}
              onAuthorChange={props.onAuthorChange}
              onMarkChange={props.onMarkChange}
              onRecommendedChange={props.onRecommendedChange}
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
                {strings.filterDrawer.clearAll}
              </button>
            )}
            <button
              type="button"
              class={`${buttonStyles.button} ${buttonStyles.primary} ${styles.showButton}`}
              onClick={() => props.onOpenChange(false)}
            >
              {strings.filterDrawer.showResults(props.resultCount)}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
};

export default FilterDrawer;
