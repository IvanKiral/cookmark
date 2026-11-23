import { createMemo, createSignal, Loading, Show } from "solid-js";
import { getRecipesList } from "~/app/api/recipeQueries.ts";
import { CollectionChips } from "~/app/collections/CollectionChips.tsx";
import { useCollections } from "~/app/collections/CollectionsContext.tsx";
import { CollectionsSheet } from "~/app/collections/CollectionsSheet.tsx";
import { sortByPin } from "~/app/collections/collectionIcons.ts";
import { LibrarySidebar } from "~/app/collections/LibrarySidebar.tsx";
import {
  describeSmartFilters,
  findPlaceCollection,
  type Place,
  parsePlaceParam,
  recipesInPlace,
  serializePlace,
} from "~/app/collections/places.ts";
import { collectionStrings } from "~/app/collections/strings.ts";
import { ActiveFilterChips } from "~/app/filters/ActiveFilterChips.tsx";
import { withoutFilterValue } from "~/app/filters/activeFilters.ts";
import { buildAuthorOptions, deriveAuthors } from "~/app/filters/deriveAuthors.ts";
import { FilterDrawer } from "~/app/filters/FilterDrawer.tsx";
import { FilterPanel } from "~/app/filters/FilterPanel.tsx";
import { countActiveFilters, filterRecipes } from "~/app/filters/recipeFilters.ts";
import { createRecipeSearch } from "~/app/filters/recipeSearch.ts";
import { SearchBar } from "~/app/filters/SearchBar.tsx";
import { filterStrings } from "~/app/filters/strings.ts";
import { useRecipeListParams } from "~/app/filters/useRecipeListParams.ts";
import { useMarks } from "~/app/marks/MarksContext.tsx";
import { RecipeList } from "~/app/recipe-list/RecipeList.tsx";
import { SortDropdown } from "~/app/recipe-list/SortDropdown.tsx";
import { sortRecipes } from "~/app/recipe-list/sortRecipes.ts";
import { recipeListStrings } from "~/app/recipe-list/strings.ts";
import { type ViewMode, ViewToggle } from "~/app/recipe-list/ViewToggle.tsx";
import { ariaBoolean } from "~/app/ui/ariaBoolean.ts";
import buttonStyles from "~/app/ui/button.module.css";
import { createMediaQuery } from "~/app/ui/createMediaQuery.ts";
import type { Collection } from "~/shared/collections.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import styles from "./index.module.css";

const DESKTOP_QUERY = "(min-width: 1024px)";

const Home = () => {
  const recipes = createMemo(() => getRecipesList());
  const authorValues = createMemo(() => deriveAuthors(recipes()));
  const authorOptions = createMemo(() => buildAuthorOptions(recipes()));
  const params = useRecipeListParams(authorValues);
  const marks = useMarks();
  const collectionsContext = useCollections();
  const collections = collectionsContext.collections;
  const isDesktop = createMediaQuery(DESKTOP_QUERY);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = createSignal(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = createSignal(false);
  const [isCollectionsSheetOpen, setIsCollectionsSheetOpen] = createSignal(false);
  // View mode is intentionally ephemeral: every page load starts in card view.
  const [viewMode, setViewMode] = createSignal<ViewMode>("card");

  const place = createMemo(() => parsePlaceParam(params.placeParam(), collections()));
  const placeCollection = createMemo(() => findPlaceCollection(place(), collections()));

  const recipesOf = (target: Place): ReadonlyArray<RecipeSummary> =>
    recipesInPlace(recipes(), target, marks.isMarked, collections());
  const countOf = (target: Place): number => recipesOf(target).length;
  const countOfCollection = (collection: Collection): number =>
    countOf({ kind: "collection", id: collection.id });

  const search = createMemo(() => createRecipeSearch(recipes()));

  const filteredRecipes = createMemo(() => {
    const matching = new Set(search()(params.searchQuery()).map((recipe) => recipe.url_slug));
    const inPlace = recipesOf(place()).filter((recipe) => matching.has(recipe.url_slug));
    return sortRecipes(filterRecipes(inPlace, params.filters()), params.sort());
  });

  const activeFilterCount = createMemo(() => countActiveFilters(params.filters()));

  const pinned = createMemo(() => sortByPin(collections()));
  const temporaryChip = createMemo(() => {
    const collection = placeCollection();
    return collection && collection.pinPosition === null ? collection : undefined;
  });

  const selectPlace = (next: Place): void => {
    params.setPlace(serializePlace(next));
  };

  const openCollection = (collection: Collection): void => {
    setIsCollectionsSheetOpen(false);
    selectPlace({ kind: "collection", id: collection.id });
  };

  const togglePin = (collection: Collection): void => {
    const isPinned = collection.pinPosition === null;
    collectionsContext.update(collection.id, {
      name: collection.name,
      filters: collection.filters,
      isPinned,
    });
  };

  const handleFiltersClick = (): void => {
    if (isDesktop()) {
      setIsFilterPanelOpen(!isFilterPanelOpen());
      return;
    }
    setIsFilterDrawerOpen(true);
  };

  const openNewSmartFilter = (): void => {
    setIsCollectionsSheetOpen(false);
    setIsFilterDrawerOpen(true);
  };

  const placeTitle = (): string => {
    const current = place();
    if (current.kind === "all") {
      return collectionStrings.places.allRecipes;
    }
    if (current.kind === "mark") {
      return current.mark === "favorite"
        ? collectionStrings.places.favorites
        : collectionStrings.places.toTry;
    }
    return placeCollection()?.name ?? "";
  };

  const placeSubtitle = (): string => {
    const count = filteredRecipes().length;
    const collection = placeCollection();
    if (collection?.kind === "manual") {
      return collectionStrings.header.manualMeta(count);
    }
    if (collection?.kind === "smart") {
      return collectionStrings.header.smartMeta(
        collection.filters ? describeSmartFilters(collection.filters) : "",
        count,
      );
    }
    return collectionStrings.recipeCount(count);
  };

  return (
    <main class={styles.main}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1 class={styles.title}>{recipeListStrings.title}</h1>
          <p class={styles.subtitle}>{recipeListStrings.subtitle}</p>
        </div>
      </header>
      <div class={styles.container}>
        <div class={styles.layout}>
          <div class={styles.sidebar}>
            <LibrarySidebar
              place={place()}
              collections={collections()}
              countOf={countOf}
              onSelectPlace={selectPlace}
            />
          </div>
          <div class={styles.controls}>
            <div class={styles.searchWrapper}>
              <SearchBar
                recipes={recipes()}
                searchQuery={params.searchQuery()}
                onSearchChange={params.setSearchQuery}
              />
            </div>
            <div class={styles.chipsRow}>
              <CollectionChips
                place={place()}
                pinned={pinned()}
                temporary={temporaryChip()}
                onSelectPlace={selectPlace}
                onOpenSheet={() => setIsCollectionsSheetOpen(true)}
              />
            </div>
            <button
              type="button"
              class={`${styles.filtersButton} ${activeFilterCount() > 0 ? styles.filtersButtonActive : ""}`}
              aria-expanded={isDesktop() ? ariaBoolean(isFilterPanelOpen()) : undefined}
              onClick={handleFiltersClick}
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                tune
              </span>
              {filterStrings.drawer.filtersButton}
              <Show when={activeFilterCount() > 0}>
                <span class={styles.filterCount}>{activeFilterCount()}</span>
              </Show>
            </button>
            <Show when={activeFilterCount() > 0}>
              <button type="button" class={styles.clearFiltersButton} onClick={params.clearFilters}>
                <span class="material-symbols-outlined">close</span>
                {filterStrings.drawer.clearAll}
              </button>
            </Show>
            <SortDropdown value={params.sort()} onSortChange={params.setSort} />
            <ViewToggle value={viewMode()} onChange={setViewMode} />
          </div>
          <div class={styles.mainContent}>
            <Show when={isFilterPanelOpen()}>
              <section class={styles.filterPanel} aria-label={filterStrings.drawer.title}>
                <FilterPanel
                  variant="toolbar"
                  filters={params.filters()}
                  authorOptions={authorOptions()}
                  onFilterChange={params.setFilter}
                />
                <div class={styles.filterPanelFooter}>
                  <button
                    type="button"
                    class={`${buttonStyles.button} ${buttonStyles.secondary}`}
                    onClick={params.clearFilters}
                  >
                    {filterStrings.drawer.clearAll}
                  </button>
                  <button
                    type="button"
                    class={`${buttonStyles.button} ${buttonStyles.primary}`}
                    onClick={() => setIsFilterPanelOpen(false)}
                  >
                    {filterStrings.drawer.showResults(filteredRecipes().length)}
                  </button>
                </div>
              </section>
            </Show>
            <Show when={!isFilterPanelOpen() && activeFilterCount() > 0}>
              <div class={styles.activeFilters}>
                <ActiveFilterChips
                  filters={params.filters()}
                  onRemove={(key, value) =>
                    params.setFilter(key, withoutFilterValue(params.filters(), key, value))
                  }
                  onClearAll={params.clearFilters}
                />
              </div>
            </Show>
            <div class={styles.placeTitle}>
              <h2 class={styles.placeName}>{placeTitle()}</h2>
              <p class={styles.placeSubtitle}>{placeSubtitle()}</p>
            </div>
            <Loading>
              <RecipeList
                recipes={filteredRecipes()}
                currentPage={params.page()}
                viewMode={viewMode()}
                onPageChange={(details) => params.setPage(details.page)}
                onResetAll={params.resetAll}
              />
            </Loading>
          </div>
        </div>
      </div>

      <FilterDrawer
        open={isFilterDrawerOpen()}
        onOpenChange={setIsFilterDrawerOpen}
        filters={params.filters()}
        authorOptions={authorOptions()}
        onFilterChange={params.setFilter}
        onClearAll={params.clearFilters}
        resultCount={filteredRecipes().length}
      />
      <CollectionsSheet
        isOpen={isCollectionsSheetOpen()}
        onOpenChange={setIsCollectionsSheetOpen}
        collections={collections()}
        countOf={countOfCollection}
        onOpenCollection={openCollection}
        onTogglePin={togglePin}
        onNewCollection={() => setIsCollectionsSheetOpen(false)}
        onNewSmartFilter={openNewSmartFilter}
      />
    </main>
  );
};

export default Home;
