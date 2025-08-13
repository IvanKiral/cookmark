import { createSignal, For } from "solid-js";
import type { TagFilter } from "~/constants/tagOptions";
import { useT } from "~/lib/i18nContext";
import styles from "./FilterSidebar.module.css";

type FilterSidebarProps = {
  onFilterChange: (difficulty: string | null) => void;
  onTimeFilterChange: (timeFilter: string | null) => void;
  onTagFilterChange: (tag: TagFilter) => void;
};

export default function FilterSidebar(props: FilterSidebarProps) {
  const t = useT();

  const difficultyOptions = [
    { value: null, label: t.filters.all },
    { value: "Easy", label: t.filters.easy },
    { value: "Medium", label: t.filters.medium },
    { value: "Hard", label: t.filters.hard },
  ] as const;

  const timeOptions = [
    { value: null, label: t.filters.all },
    { value: "under30", label: t.filters.under30 },
    { value: "under60", label: t.filters.under60 },
    { value: "over60", label: t.filters.over60 },
  ] as const;

  const tagOptions = [
    { value: null, label: t.tags.all },
    { value: "Chicken", label: t.tags.chicken },
    { value: "Pork", label: t.tags.pork },
    { value: "Beef", label: t.tags.beef },
    { value: "Fish", label: t.tags.fish },
    { value: "Vegan", label: t.tags.vegan },
    { value: "Dessert", label: t.tags.dessert },
    { value: "Lactose-free", label: t.tags.lactoseFree },
    { value: "Low-Sugar", label: t.tags.lowSugar },
    { value: "Cake", label: t.tags.cake },
  ] as const;
  const [selectedDifficulty, setSelectedDifficulty] = createSignal<string | null>(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = createSignal<string | null>(null);
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
        <h3 class={styles.filterTitle}>{t.filters.difficulty}</h3>
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
        <h3 class={styles.filterTitle}>{t.filters.time}</h3>
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
        <h3 class={styles.filterTitle}>{t.filters.tags}</h3>
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
