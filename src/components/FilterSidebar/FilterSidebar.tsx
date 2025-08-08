import { createSignal, For } from "solid-js";
import { tagOptions, type TagFilter } from "~/constants/tagOptions";
import styles from "./FilterSidebar.module.css";

type FilterSidebarProps = {
  onFilterChange: (difficulty: string | null) => void;
  onTimeFilterChange: (timeFilter: string | null) => void;
  onTagFilterChange: (tag: TagFilter) => void;
};

const difficultyOptions = [
  { value: null, label: "All" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
] as const;

const timeOptions = [
  { value: null, label: "All" },
  { value: "under30", label: "Under 30 min" },
  { value: "under60", label: "Under 1 hour" },
  { value: "over60", label: "1+ hours" },
] as const;


export default function FilterSidebar(props: FilterSidebarProps) {
  const [selectedDifficulty, setSelectedDifficulty] = createSignal<
    string | null
  >(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = createSignal<
    string | null
  >(null);
  const [selectedTag, setSelectedTag] = createSignal<TagFilter>(null);

  const handleDifficultyChange = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
    props.onFilterChange(difficulty);
  };

  const handleTimeFilterChange = (timeFilter: string | null) => {
    setSelectedTimeFilter(timeFilter);
    props.onTimeFilterChange(timeFilter);
  };

  const handleTagChange = (tag: TagFilter) => {
    setSelectedTag(tag);
    props.onTagFilterChange(tag);
  };

  return (
    <aside class={styles.sidebar}>
      <div class={styles.filterSection}>
        <h3 class={styles.filterTitle}>Difficulty</h3>
        <div class={styles.filterOptions}>
          <For each={difficultyOptions}>
            {(option) => (
              <label class={styles.filterOption}>
                <input
                  type="radio"
                  name="difficulty"
                  checked={selectedDifficulty() === option.value}
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
        <h3 class={styles.filterTitle}>Time</h3>
        <div class={styles.filterOptions}>
          <For each={timeOptions}>
            {(option) => (
              <label class={styles.filterOption}>
                <input
                  type="radio"
                  name="timeFilter"
                  checked={selectedTimeFilter() === option.value}
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
        <h3 class={styles.filterTitle}>Tags</h3>
        <div class={styles.filterOptions}>
          <For each={tagOptions}>
            {(option) => (
              <label class={styles.filterOption}>
                <input
                  type="radio"
                  name="tagFilter"
                  checked={selectedTag() === option.value}
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
