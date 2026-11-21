import { createMemo, createSignal, Loading, Show } from "solid-js";
import { getRecipesList } from "~/app/api/recipeQueries.ts";
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
import styles from "./index.module.css";

const Home = () => {
  const recipes = createMemo(() => getRecipesList());
  const authorValues = createMemo(() => deriveAuthors(recipes()));
  const authorOptions = createMemo(() => buildAuthorOptions(recipes()));
  const params = useRecipeListParams(authorValues);
  const marks = useMarks();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = createSignal(false);
  // View mode is intentionally ephemeral: every page load starts in card view.
  const [viewMode, setViewMode] = createSignal<ViewMode>("card");

  const search = createMemo(() => createRecipeSearch(recipes()));

  const filteredRecipes = createMemo(() =>
    sortRecipes(
      filterRecipes(search()(params.searchQuery()), params.filters(), marks.isMarked),
      params.sort(),
    ),
  );

  const activeFilterCount = createMemo(() => countActiveFilters(params.filters()));

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
          <aside class={styles.sidebar} aria-label={filterStrings.panelLabel}>
            <div class={styles.sidebarHeader}>
              <span class={styles.sidebarTitle}>{filterStrings.drawer.title}</span>
              <Show when={activeFilterCount() > 0}>
                <button
                  type="button"
                  class={styles.sidebarClearButton}
                  onClick={params.clearFilters}
                >
                  {filterStrings.drawer.clearAll}
                </button>
              </Show>
            </div>
            <FilterPanel
              filters={params.filters()}
              authorOptions={authorOptions()}
              onFilterChange={params.setFilter}
            />
          </aside>
          <div class={styles.controls}>
            <button
              type="button"
              class={`${styles.filtersButton} ${activeFilterCount() > 0 ? styles.filtersButtonActive : ""}`}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <span class="material-symbols-outlined">tune</span>
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
            <div class={styles.searchWrapper}>
              <SearchBar
                recipes={recipes()}
                searchQuery={params.searchQuery()}
                onSearchChange={params.setSearchQuery}
              />
            </div>
            <SortDropdown value={params.sort()} onSortChange={params.setSort} />
            <ViewToggle value={viewMode()} onChange={setViewMode} />
          </div>
          <div class={styles.mainContent}>
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
    </main>
  );
};

export default Home;
