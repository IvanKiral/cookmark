import type { JSX } from "@solidjs/web";
import { type Component, createMemo, createSignal, For, Show } from "solid-js";
import type { AuthorOption } from "./deriveAuthors.ts";
import styles from "./FilterPanel.module.css";
import { difficultyOptions, recommendedOptions, tagGroups, timeOptions } from "./filterOptions.ts";
import type { RecipeFilterKey, RecipeFilters } from "./recipeFilters.ts";
import { filterStrings } from "./strings.ts";

type FilterPanelProps = {
  filters: RecipeFilters;
  authorOptions: ReadonlyArray<AuthorOption>;
  onFilterChange: <K extends RecipeFilterKey>(key: K, values: RecipeFilters[K]) => void;
  // Both show options as chips. "drawer" (phones and tablets) makes every
  // target 44px tall for touch; "toolbar" (the desktop filters panel) keeps
  // them compact and lays the groups out in a grid, never collapsed.
  variant: "drawer" | "toolbar";
};

const toggleValue = <T extends string>(current: ReadonlyArray<T>, value: T): T[] =>
  current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

type FilterSectionProps<T extends string> = {
  title: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: ReadonlyArray<T>;
  onToggle: (value: T) => void;
  isTouch: boolean;
  isCollapsible: boolean;
};

type CollapsibleSectionProps = {
  title: string;
  selectedCount: number;
  isCollapsible: boolean;
  children: JSX.Element;
};

// A native <details>, so it toggles with a click, Enter or Space and needs no
// extra state. Every section starts expanded.
const CollapsibleSection: Component<CollapsibleSectionProps> = (props) => (
  <Show
    when={props.isCollapsible}
    fallback={
      <div class={styles.gridSection}>
        <span class={styles.sectionTitle}>{props.title}</span>
        <div class={styles.sectionBody}>{props.children}</div>
      </div>
    }
  >
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
  </Show>
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
    isCollapsible={props.isCollapsible}
  >
    <div class={styles.chipGroup}>
      <For each={props.options}>
        {(option) => (
          <label
            class={[
              styles.chip,
              {
                [styles.chipCompact]: !props.isTouch,
                [styles.chipSelected]: props.selected.includes(option.value),
              },
            ]}
          >
            <input
              type="checkbox"
              checked={props.selected.includes(option.value)}
              onChange={() => props.onToggle(option.value)}
              class={styles.visuallyHidden}
            />
            <span>{option.label}</span>
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
  isTouch: boolean;
  isCollapsible: boolean;
};

// The author list starts short so it doesn't dominate the panel's scroll.
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
    !isShowingAll() && query().trim() === "" && visibleOptions().length > AUTHOR_PREVIEW_COUNT;

  const shownOptions = createMemo(() =>
    isPreviewLimited()
      ? visibleOptions().slice(0, Math.max(AUTHOR_PREVIEW_COUNT, props.selected.length))
      : visibleOptions(),
  );

  const canToggleAll = (): boolean =>
    query().trim() === "" && props.options.length > AUTHOR_PREVIEW_COUNT;

  return (
    <CollapsibleSection
      title={props.title}
      selectedCount={props.selected.length}
      isCollapsible={props.isCollapsible}
    >
      <input
        type="search"
        class={styles.searchInput}
        placeholder={props.placeholder}
        value={query()}
        onInput={(event) => setQuery(event.currentTarget.value)}
      />
      {/* Authors stay a list (many, long names). It never scrolls on its own,
          so swipes and the wheel always scroll the drawer or the sidebar. */}
      <div class={styles.checkboxGroup}>
        <For
          each={shownOptions()}
          fallback={<span class={styles.noMatches}>{props.noMatchesLabel}</span>}
        >
          {(option) => (
            <label class={[styles.checkboxLabel, { [styles.touchRow]: props.isTouch }]}>
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
            ? filterStrings.authorShowFewer
            : filterStrings.authorShowAll(props.options.length)}
        </button>
      </Show>
    </CollapsibleSection>
  );
};

export const FilterPanel: Component<FilterPanelProps> = (props) => {
  const isTouch = (): boolean => props.variant === "drawer";
  const isCollapsible = (): boolean => props.variant !== "toolbar";

  const toggle =
    <K extends RecipeFilterKey>(key: K) =>
    (value: RecipeFilters[K][number]): void => {
      props.onFilterChange(key, toggleValue(props.filters[key], value) as RecipeFilters[K]);
    };

  return (
    <div class={props.variant === "toolbar" ? styles.gridPanel : styles.panel}>
      <FilterSection
        title={filterStrings.recommended}
        options={recommendedOptions}
        selected={props.filters.recommended}
        onToggle={toggle("recommended")}
        isTouch={isTouch()}
        isCollapsible={isCollapsible()}
      />
      <For each={tagGroups}>
        {(group) => (
          <FilterSection
            title={group.label}
            options={group.options}
            selected={props.filters.tag}
            onToggle={toggle("tag")}
            isTouch={isTouch()}
            isCollapsible={isCollapsible()}
          />
        )}
      </For>
      <FilterSection
        title={filterStrings.time}
        options={timeOptions}
        selected={props.filters.time}
        onToggle={toggle("time")}
        isTouch={isTouch()}
        isCollapsible={isCollapsible()}
      />
      <FilterSection
        title={filterStrings.difficulty}
        options={difficultyOptions}
        selected={props.filters.difficulty}
        onToggle={toggle("difficulty")}
        isTouch={isTouch()}
        isCollapsible={isCollapsible()}
      />
      <Show when={props.authorOptions.length > 0}>
        <SearchableFilterSection
          title={filterStrings.author}
          placeholder={filterStrings.authorSearchPlaceholder}
          noMatchesLabel={filterStrings.authorNoMatches}
          options={props.authorOptions}
          selected={props.filters.author}
          onToggle={toggle("author")}
          isTouch={isTouch()}
          isCollapsible={isCollapsible()}
        />
      </Show>
    </div>
  );
};
