import { For } from "solid-js";
import type { DifficultyFilter } from "~/constants/difficultyOptions";
import {
  createDifficultyOptions,
  createTagOptions,
  createTimeOptions,
} from "~/constants/filterOptions";
import type { TagFilter } from "~/constants/tagOptions";
import type { TimeFilter } from "~/constants/timeOptions";
import { useT } from "~/lib/i18nContext";
import styles from "./FilterSidebar.module.css";

type FilterSidebarProps = {
  difficultyFilter: DifficultyFilter;
  timeFilter: TimeFilter;
  tagFilter: TagFilter;
  onFilterChange: (difficulty: DifficultyFilter) => void;
  onTimeFilterChange: (timeFilter: TimeFilter) => void;
  onTagFilterChange: (tag: TagFilter) => void;
};

export default function FilterSidebar(props: FilterSidebarProps) {
  const t = useT();

  const difficultyOptions = createDifficultyOptions(t);
  const timeOptions = createTimeOptions(t);
  const tagOptions = createTagOptions(t);

  const handleDifficultyChange = (difficulty: DifficultyFilter) => {
    props.onFilterChange(difficulty);
  };

  const handleTimeFilterChange = (timeFilter: TimeFilter) => {
    props.onTimeFilterChange(timeFilter);
  };

  const handleTagChange = (tag: TagFilter) => {
    props.onTagFilterChange(tag);
  };

  return (
    <aside class={styles.sidebar}>
      <div class={styles.filterSection}>
        <h3 class={styles.filterTitle}>{t.filters.difficulty}</h3>
        <div class={styles.filterOptions}>
          <For each={difficultyOptions}>
            {(option) => (
              <label class={styles.filterOption}>
                <input
                  type="radio"
                  name="difficulty"
                  checked={props.difficultyFilter === option.value}
                  onChange={() => handleDifficultyChange(option.value)}
                  class={styles.filterInput}
                />
                <span class={styles.filterLabel}>{option.label}</span>
              </label>
            )}
          </For>
        </div>
      </div>

      <div class={styles.filterSection}>
        <h3 class={styles.filterTitle}>{t.filters.time}</h3>
        <div class={styles.filterOptions}>
          <For each={timeOptions}>
            {(option) => (
              <label class={styles.filterOption}>
                <input
                  type="radio"
                  name="timeFilter"
                  checked={props.timeFilter === option.value}
                  onChange={() => handleTimeFilterChange(option.value)}
                  class={styles.filterInput}
                />
                <span class={styles.filterLabel}>{option.label}</span>
              </label>
            )}
          </For>
        </div>
      </div>

      <div class={styles.filterSection}>
        <h3 class={styles.filterTitle}>{t.filters.tags}</h3>
        <div class={styles.filterOptions}>
          <For each={tagOptions}>
            {(option) => (
              <label class={styles.filterOption}>
                <input
                  type="radio"
                  name="tagFilter"
                  checked={props.tagFilter === option.value}
                  onChange={() => handleTagChange(option.value)}
                  class={styles.filterInput}
                />
                <span class={styles.filterLabel}>{option.label}</span>
              </label>
            )}
          </For>
        </div>
      </div>
    </aside>
  );
}
