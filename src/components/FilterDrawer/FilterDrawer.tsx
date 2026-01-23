import Drawer from "@corvu/drawer";
import { type Component, For } from "solid-js";
import type { DifficultyFilter, DifficultyValue } from "~/constants/difficultyOptions";
import { difficultyOptions, tagOptions, timeOptions } from "~/constants/filterOptions";
import { strings } from "~/constants/strings";
import type { TagFilter, TagValue } from "~/constants/tagOptions";
import type { TimeFilter, TimeValue } from "~/constants/timeOptions";
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
  const handleDifficultyToggle = (value: DifficultyValue) => {
    const current = props.difficultyFilter;
    const newFilter = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    props.onDifficultyChange(newFilter as DifficultyFilter);
  };

  const handleTimeToggle = (value: TimeValue) => {
    const current = props.timeFilter;
    const newFilter = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    props.onTimeChange(newFilter as TimeFilter);
  };

  const handleTagToggle = (value: TagValue) => {
    const current = props.tagFilter;
    const newFilter = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    props.onTagChange(newFilter as TagFilter);
  };

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
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>{strings.filters.difficulty}</h3>
              <div class={styles.checkboxGroup}>
                <For each={difficultyOptions}>
                  {(option) => (
                    <label class={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={props.difficultyFilter.includes(option.value)}
                        onChange={() => handleDifficultyToggle(option.value)}
                        class={styles.checkbox}
                      />
                      <span class={styles.checkboxText}>{option.label}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>

            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>{strings.filters.time}</h3>
              <div class={styles.checkboxGroup}>
                <For each={timeOptions}>
                  {(option) => (
                    <label class={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={props.timeFilter.includes(option.value)}
                        onChange={() => handleTimeToggle(option.value)}
                        class={styles.checkbox}
                      />
                      <span class={styles.checkboxText}>{option.label}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>

            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>{strings.filters.tags}</h3>
              <div class={styles.checkboxGroup}>
                <For each={tagOptions}>
                  {(option) => (
                    <label class={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={props.tagFilter.includes(option.value)}
                        onChange={() => handleTagToggle(option.value)}
                        class={styles.checkbox}
                      />
                      <span class={styles.checkboxText}>{option.label}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>
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
