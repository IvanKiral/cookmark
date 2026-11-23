import { type Component, Show } from "solid-js";
import { CollectionChips } from "~/app/collections/CollectionChips.tsx";
import { collectionStrings } from "~/app/collections/strings.ts";
import { SearchBar } from "~/app/filters/SearchBar.tsx";
import { filterStrings } from "~/app/filters/strings.ts";
import { defaultListSort, listSortOptions } from "~/app/recipe-list/listSort.ts";
import { SortDropdown } from "~/app/recipe-list/SortDropdown.tsx";
import { recipeListStrings } from "~/app/recipe-list/strings.ts";
import { ViewToggle } from "~/app/recipe-list/ViewToggle.tsx";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import type { ListPage } from "./createListPage.ts";
import styles from "./ListPage.module.css";

// Search, the phone chips row, Filters, Sort, Select and the view toggle.
export const ListToolbar: Component<{ page: ListPage }> = (props) => {
  const params = props.page.params;
  const hasFilters = (): boolean => props.page.activeFilterCount() > 0;

  return (
    <>
      <div class={styles.searchWrapper}>
        <SearchBar
          recipes={props.page.recipes()}
          searchQuery={params.searchQuery()}
          onSearchChange={params.setSearchQuery}
        />
      </div>
      <div class={styles.chipsRow}>
        <CollectionChips
          place={props.page.place()}
          pinned={props.page.pinned()}
          temporary={props.page.temporaryChip()}
          onSelectPlace={props.page.selectPlace}
          onOpenSheet={() => props.page.collectionsSheet.setIsOpen(true)}
        />
      </div>
      <button
        type="button"
        class={`${styles.filtersButton} ${hasFilters() ? styles.filtersButtonActive : ""}`}
        aria-expanded={
          props.page.isDesktop() ? ariaBoolean(props.page.filterPanel.isOpen()) : undefined
        }
        onClick={() => props.page.handleFiltersClick()}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          tune
        </span>
        {filterStrings.drawer.filtersButton}
        <Show when={hasFilters()}>
          <span class={styles.filterCount}>{props.page.activeFilterCount()}</span>
        </Show>
      </button>
      <Show when={hasFilters()}>
        <button type="button" class={styles.clearFiltersButton} onClick={params.clearFilters}>
          <span class="material-symbols-outlined">close</span>
          {filterStrings.drawer.clearAll}
        </button>
      </Show>
      <SortDropdown
        value={props.page.sort()}
        options={listSortOptions(props.page.isManualPlace())}
        defaultValue={defaultListSort(props.page.isManualPlace())}
        defaultLabel={
          props.page.isManualPlace()
            ? collectionStrings.sort.yourOrder
            : recipeListStrings.sort.label
        }
        onSortChange={props.page.setSort}
      />
      <button
        type="button"
        class={`${styles.filtersButton} ${styles.selectButton}`}
        aria-label={collectionStrings.select.enter}
        onClick={() => props.page.selection.start({ kind: "select" })}
      >
        <span class="material-symbols-outlined" aria-hidden="true">
          checklist
        </span>
        <span class={styles.selectLabel}>{collectionStrings.select.enterShort}</span>
      </button>
      <ViewToggle value={props.page.viewMode()} onChange={props.page.setViewMode} />
    </>
  );
};
