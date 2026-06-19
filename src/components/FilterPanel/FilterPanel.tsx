import { type Component, For } from "solid-js";
import type { DifficultyFilter, DifficultyValue } from "~/constants/difficultyOptions.ts";
import { difficultyOptions, tagGroups, timeOptions } from "~/constants/filterOptions.ts";
import { strings } from "~/constants/strings.ts";
import type { TagFilter, TagValue } from "~/constants/tagOptions.ts";
import type { TimeFilter, TimeValue } from "~/constants/timeOptions.ts";
import styles from "./FilterPanel.module.css";

type FilterPanelProps = {
  difficultyFilter: DifficultyFilter;
  timeFilter: TimeFilter;
  tagFilter: TagFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onTimeChange: (time: TimeFilter) => void;
  onTagChange: (tag: TagFilter) => void;
};

const toggleValue = <T extends string>(current: ReadonlyArray<T>, value: T): T[] =>
  current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

type FilterSectionProps<T extends string> = {
  title: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: ReadonlyArray<T>;
  onToggle: (value: T) => void;
};

const FilterSection = <T extends string>(props: FilterSectionProps<T>) => (
  <div class={styles.section}>
    <h3 class={styles.sectionTitle}>{props.title}</h3>
    <div class={styles.checkboxGroup}>
      <For each={props.options}>
        {(option) => (
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={props.selected.includes(option.value)}
              onChange={() => props.onToggle(option.value)}
              class={styles.checkbox}
            />
            <span class={styles.checkboxText}>{option.label}</span>
          </label>
        )}
      </For>
    </div>
  </div>
);

const FilterPanel: Component<FilterPanelProps> = (props) => {
  const handleDifficultyToggle = (value: DifficultyValue) => {
    props.onDifficultyChange(toggleValue(props.difficultyFilter, value) as DifficultyFilter);
  };

  const handleTimeToggle = (value: TimeValue) => {
    props.onTimeChange(toggleValue(props.timeFilter, value) as TimeFilter);
  };

  const handleTagToggle = (value: TagValue) => {
    props.onTagChange(toggleValue(props.tagFilter, value) as TagFilter);
  };

  return (
    <div class={styles.panel}>
      <FilterSection
        title={strings.filters.difficulty}
        options={difficultyOptions}
        selected={props.difficultyFilter}
        onToggle={handleDifficultyToggle}
      />
      <FilterSection
        title={strings.filters.time}
        options={timeOptions}
        selected={props.timeFilter}
        onToggle={handleTimeToggle}
      />
      <For each={tagGroups}>
        {(group) => (
          <FilterSection
            title={group.label}
            options={group.options}
            selected={props.tagFilter}
            onToggle={handleTagToggle}
          />
        )}
      </For>
    </div>
  );
};

export default FilterPanel;
