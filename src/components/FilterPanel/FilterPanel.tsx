import { type Component, createMemo, createSignal, For, Show } from "solid-js";
import type { DifficultyFilter, DifficultyValue } from "~/constants/difficultyOptions.ts";
import { difficultyOptions, tagGroups, timeOptions } from "~/constants/filterOptions.ts";
import { strings } from "~/constants/strings.ts";
import type { TagFilter, TagValue } from "~/constants/tagOptions.ts";
import type { TimeFilter, TimeValue } from "~/constants/timeOptions.ts";
import type { AuthorOption } from "~/utils/deriveAuthors.ts";
import styles from "./FilterPanel.module.css";

type FilterPanelProps = {
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

type SearchableFilterSectionProps = {
  title: string;
  placeholder: string;
  noMatchesLabel: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: ReadonlyArray<string>;
  onToggle: (value: string) => void;
};

const SearchableFilterSection = (props: SearchableFilterSectionProps) => {
  const [query, setQuery] = createSignal("");

  // Selected options stay visible even when they don't match the query, so a
  // current selection is never silently hidden.
  const visibleOptions = createMemo(() => {
    const normalized = query().trim().toLowerCase();
    const matches = props.options.filter((option) => {
      if (props.selected.includes(option.value)) {
        return true;
      }
      if (!normalized) {
        return true;
      }
      return (
        option.label.toLowerCase().includes(normalized) ||
        option.value.toLowerCase().includes(normalized)
      );
    });
    return [...matches].sort((a, b) => {
      const aSelected = props.selected.includes(a.value) ? 0 : 1;
      const bSelected = props.selected.includes(b.value) ? 0 : 1;
      return aSelected - bSelected || a.label.localeCompare(b.label);
    });
  });

  return (
    <div class={styles.section}>
      <h3 class={styles.sectionTitle}>{props.title}</h3>
      <input
        type="search"
        class={styles.searchInput}
        placeholder={props.placeholder}
        value={query()}
        onInput={(event) => setQuery(event.currentTarget.value)}
      />
      <div class={`${styles.checkboxGroup} ${styles.scrollableGroup}`}>
        <For
          each={visibleOptions()}
          fallback={<span class={styles.noMatches}>{props.noMatchesLabel}</span>}
        >
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
};

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

  const handleAuthorToggle = (value: string) => {
    props.onAuthorChange(toggleValue(props.authorFilter, value));
  };

  return (
    <div class={styles.panel}>
      <div class={styles.section}>
        <h3 class={styles.sectionTitle}>{strings.favorites.sectionTitle}</h3>
        <div class={styles.checkboxGroup}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={props.favoritesOnly}
              onChange={() => props.onFavoritesOnlyChange(!props.favoritesOnly)}
              class={styles.checkbox}
            />
            <span class={styles.checkboxText}>{strings.favorites.only}</span>
          </label>
        </div>
      </div>
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
      <Show when={props.authorOptions.length > 0}>
        <SearchableFilterSection
          title={strings.filters.author}
          placeholder={strings.filters.authorSearchPlaceholder}
          noMatchesLabel={strings.filters.authorNoMatches}
          options={props.authorOptions}
          selected={props.authorFilter}
          onToggle={handleAuthorToggle}
        />
      </Show>
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
    </div>
  );
};

export default FilterPanel;
