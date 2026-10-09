import { type Component, createMemo, createSignal, For, type JSX, Show } from "solid-js";
import type { DifficultyFilter, DifficultyValue } from "~/constants/difficultyOptions.ts";
import {
  difficultyOptions,
  markOptions,
  recommendedOptions,
  tagGroups,
  timeOptions,
} from "~/constants/filterOptions.ts";
import type { Mark, MarkFilter } from "~/constants/markOptions.ts";
import type { RecommendedFilter, RecommendedValue } from "~/constants/recommendedOptions.ts";
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
  markFilter: MarkFilter;
  recommendedFilter: RecommendedFilter;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onTimeChange: (time: TimeFilter) => void;
  onTagChange: (tag: TagFilter) => void;
  onAuthorChange: (author: ReadonlyArray<string>) => void;
  onMarkChange: (marks: MarkFilter) => void;
  onRecommendedChange: (recommended: RecommendedFilter) => void;
  // "chips" (used in the phone and tablet drawer) wraps options as 44px chips
  // so the expanded panel fits about one screen; "list" is the desktop sidebar.
  layout?: "list" | "chips";
};

const toggleValue = <T extends string>(current: ReadonlyArray<T>, value: T): T[] =>
  current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

type FilterSectionProps<T extends string> = {
  title: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: ReadonlyArray<T>;
  onToggle: (value: T) => void;
  isChips: boolean;
};

type CollapsibleSectionProps = {
  title: string;
  selectedCount: number;
  children: JSX.Element;
};

// A native <details>, so it toggles with a click, Enter or Space and needs no
// extra state. Every section starts expanded.
const CollapsibleSection: Component<CollapsibleSectionProps> = (props) => (
  <details class={styles.section} open>
    <summary class={styles.summary}>
      <span class={styles.sectionTitle}>{props.title}</span>
      <Show when={props.selectedCount > 0}>
        <span class={styles.count}>{props.selectedCount}</span>
      </Show>
      <span class={`material-symbols-outlined ${styles.chevron}`} aria-hidden="true">
        expand_more
      </span>
    </summary>
    <div class={styles.sectionBody}>{props.children}</div>
  </details>
);

// Counts only this section's options; tag groups share one selected list.
const countSelected = <T extends string>(
  options: ReadonlyArray<{ value: T }>,
  selected: ReadonlyArray<string>,
): number => options.filter((option) => selected.includes(option.value)).length;

const FilterSection = <T extends string>(props: FilterSectionProps<T>) => (
  <CollapsibleSection
    title={props.title}
    selectedCount={countSelected(props.options, props.selected)}
  >
    <div class={props.isChips ? styles.chipGroup : styles.checkboxGroup}>
      <For each={props.options}>
        {(option) => (
          <label
            class={props.isChips ? styles.chip : styles.checkboxLabel}
            classList={{
              [styles.chipSelected]: props.isChips && props.selected.includes(option.value),
            }}
          >
            <input
              type="checkbox"
              checked={props.selected.includes(option.value)}
              onChange={() => props.onToggle(option.value)}
              class={props.isChips ? styles.visuallyHidden : styles.checkbox}
            />
            <span class={props.isChips ? undefined : styles.checkboxText}>{option.label}</span>
          </label>
        )}
      </For>
    </div>
  </CollapsibleSection>
);

type SearchableFilterSectionProps = {
  title: string;
  placeholder: string;
  noMatchesLabel: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: ReadonlyArray<string>;
  onToggle: (value: string) => void;
  isChips: boolean;
};

// In the drawer, the author list starts short so it doesn't dominate the scroll.
const AUTHOR_PREVIEW_COUNT = 5;

const SearchableFilterSection = (props: SearchableFilterSectionProps) => {
  const [query, setQuery] = createSignal("");
  const [isShowingAll, setIsShowingAll] = createSignal(false);

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

  // Searching or a selection beyond the preview always shows every match.
  const isPreviewLimited = (): boolean =>
    props.isChips &&
    !isShowingAll() &&
    query().trim() === "" &&
    visibleOptions().length > AUTHOR_PREVIEW_COUNT;

  const shownOptions = createMemo(() =>
    isPreviewLimited()
      ? visibleOptions().slice(0, Math.max(AUTHOR_PREVIEW_COUNT, props.selected.length))
      : visibleOptions(),
  );

  const canToggleAll = (): boolean =>
    props.isChips && query().trim() === "" && props.options.length > AUTHOR_PREVIEW_COUNT;

  return (
    <CollapsibleSection title={props.title} selectedCount={props.selected.length}>
      <input
        type="search"
        class={styles.searchInput}
        placeholder={props.placeholder}
        value={query()}
        onInput={(event) => setQuery(event.currentTarget.value)}
      />
      {/* Authors stay a list (many, long names). In the drawer the list isn't
          scrollable on its own, so swipes always scroll the drawer. */}
      <div class={styles.checkboxGroup} classList={{ [styles.scrollableGroup]: !props.isChips }}>
        <For
          each={shownOptions()}
          fallback={<span class={styles.noMatches}>{props.noMatchesLabel}</span>}
        >
          {(option) => (
            <label class={styles.checkboxLabel} classList={{ [styles.touchRow]: props.isChips }}>
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
      <Show when={canToggleAll()}>
        <button
          type="button"
          class={styles.showAllButton}
          onClick={() => setIsShowingAll((current) => !current)}
        >
          {isShowingAll()
            ? strings.filters.authorShowFewer
            : strings.filters.authorShowAll(props.options.length)}
        </button>
      </Show>
    </CollapsibleSection>
  );
};

const FilterPanel: Component<FilterPanelProps> = (props) => {
  const isChips = (): boolean => props.layout === "chips";

  const handleDifficultyToggle = (value: DifficultyValue) => {
    props.onDifficultyChange(toggleValue(props.difficultyFilter, value) as DifficultyFilter);
  };

  const handleTimeToggle = (value: TimeValue) => {
    props.onTimeChange(toggleValue(props.timeFilter, value) as TimeFilter);
  };

  const handleTagToggle = (value: TagValue) => {
    props.onTagChange(toggleValue(props.tagFilter, value) as TagFilter);
  };

  const handleMarkToggle = (value: Mark) => {
    props.onMarkChange(toggleValue(props.markFilter, value));
  };

  const handleRecommendedToggle = (value: RecommendedValue) => {
    props.onRecommendedChange(toggleValue(props.recommendedFilter, value));
  };

  const handleAuthorToggle = (value: string) => {
    props.onAuthorChange(toggleValue(props.authorFilter, value));
  };

  return (
    <div class={styles.panel}>
      <FilterSection
        title={strings.marks.sectionTitle}
        options={markOptions}
        selected={props.markFilter}
        onToggle={handleMarkToggle}
        isChips={isChips()}
      />
      <FilterSection
        title={strings.filters.recommended}
        options={recommendedOptions}
        selected={props.recommendedFilter}
        onToggle={handleRecommendedToggle}
        isChips={isChips()}
      />
      <For each={tagGroups}>
        {(group) => (
          <FilterSection
            title={group.label}
            options={group.options}
            selected={props.tagFilter}
            onToggle={handleTagToggle}
            isChips={isChips()}
          />
        )}
      </For>
      <FilterSection
        title={strings.filters.time}
        options={timeOptions}
        selected={props.timeFilter}
        onToggle={handleTimeToggle}
        isChips={isChips()}
      />
      <FilterSection
        title={strings.filters.difficulty}
        options={difficultyOptions}
        selected={props.difficultyFilter}
        onToggle={handleDifficultyToggle}
        isChips={isChips()}
      />
      <Show when={props.authorOptions.length > 0}>
        <SearchableFilterSection
          title={strings.filters.author}
          placeholder={strings.filters.authorSearchPlaceholder}
          noMatchesLabel={strings.filters.authorNoMatches}
          options={props.authorOptions}
          selected={props.authorFilter}
          onToggle={handleAuthorToggle}
          isChips={isChips()}
        />
      </Show>
    </div>
  );
};

export default FilterPanel;
