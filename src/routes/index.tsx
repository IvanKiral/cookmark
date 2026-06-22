import { useSearchParams } from "@solidjs/router";
import Fuse from "fuse.js";
import { createMemo, createSignal, Show } from "solid-js";
import FilterDrawer from "~/components/FilterDrawer/FilterDrawer.tsx";
import FilterPanel from "~/components/FilterPanel/FilterPanel.tsx";
import RecipeList from "~/components/RecipeList/RecipeList.tsx";
import SearchBar from "~/components/SearchBar/SearchBar.tsx";
import SortDropdown from "~/components/SortDropdown/SortDropdown.tsx";
import {
  type DifficultyFilter,
  type DifficultyValue,
  difficultyValues,
} from "~/constants/difficultyOptions.ts";
import { DEFAULT_SORT, type SortValue, sortValues } from "~/constants/sortOptions.ts";
import { strings } from "~/constants/strings.ts";
import { type TagFilter, type TagValue, tagValues } from "~/constants/tagOptions.ts";
import { type TimeFilter, type TimeValue, timeValues } from "~/constants/timeOptions.ts";
import { useFavorites } from "~/contexts/FavoritesContext.tsx";
import type { Recipe } from "~/types/Recipe.ts";
import { buildAuthorOptions, deriveAuthors } from "~/utils/deriveAuthors.ts";
import { loadRecipes } from "~/utils/loadRecipes.ts";
import styles from "./index.module.css";

const parseArrayParam = <T extends string>(
  param: string | string[] | undefined,
  validValues: ReadonlyArray<T>,
): ReadonlyArray<T> => {
  if (!param) {
    return [];
  }
  const values = Array.isArray(param) ? param : param.split(",");
  return values.filter((v): v is T => validValues.includes(v as T));
};

const serializeArrayParam = <T extends string>(values: ReadonlyArray<T>): string | undefined =>
  values.length > 0 ? values.join(",") : undefined;

const Home = () => {
  const recipes: Recipe[] = loadRecipes();
  const authorValues = deriveAuthors(recipes);
  const authorOptions = buildAuthorOptions(recipes);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = createSignal(false);
  const favorites = useFavorites();

  const favoritesOnly = createMemo(() => searchParams.fav === "1");

  const difficultyFilter = createMemo(
    (): DifficultyFilter =>
      parseArrayParam(searchParams.difficulty, difficultyValues as ReadonlyArray<DifficultyValue>),
  );

  const timeFilter = createMemo(
    (): TimeFilter => parseArrayParam(searchParams.time, timeValues as ReadonlyArray<TimeValue>),
  );

  const tagFilter = createMemo(
    (): TagFilter => parseArrayParam(searchParams.tag, tagValues as ReadonlyArray<TagValue>),
  );

  const authorFilter = createMemo(
    (): ReadonlyArray<string> => parseArrayParam(searchParams.author, authorValues),
  );

  const sortBy = createMemo(() => {
    const value = searchParams.sort as SortValue;
    return sortValues.includes(value) ? value : DEFAULT_SORT;
  });

  const searchQuery = createMemo(() => searchParams.q || "");

  const currentPage = createMemo(() => {
    const pageParam = searchParams.page;
    if (!pageParam || Array.isArray(pageParam)) {
      return 1;
    }
    const page = Number.parseInt(pageParam, 10);
    return Number.isNaN(page) || page < 1 ? 1 : page;
  });

  const fuse = createMemo(
    () =>
      new Fuse(recipes, {
        keys: [
          { name: "name", weight: 0.5 },
          { name: "ingredients", weight: 0.25 },
          { name: "tags", weight: 0.15 },
          { name: "author", weight: 0.15 },
          { name: "description", weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      }),
  );

  const getSortComparator = (sortBy: SortValue) => {
    switch (sortBy) {
      case "date-desc":
        return (a: Recipe, b: Recipe) => b.created_at.localeCompare(a.created_at);
      case "date-asc":
        return (a: Recipe, b: Recipe) => a.created_at.localeCompare(b.created_at);
      case "name-asc":
        return (a: Recipe, b: Recipe) => a.name.localeCompare(b.name);
      case "name-desc":
        return (a: Recipe, b: Recipe) => b.name.localeCompare(a.name);
      case "time-asc":
        return (a: Recipe, b: Recipe) => a.total_time - b.total_time;
      case "time-desc":
        return (a: Recipe, b: Recipe) => b.total_time - a.total_time;
      case "difficulty-easy": {
        const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2, Unknown: 3 };
        return (a: Recipe, b: Recipe) =>
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      case "difficulty-hard": {
        const difficultyOrderReverse = { Hard: 0, Medium: 1, Easy: 2, Unknown: 3 };
        return (a: Recipe, b: Recipe) =>
          difficultyOrderReverse[a.difficulty] - difficultyOrderReverse[b.difficulty];
      }
      default:
        return (a: Recipe, b: Recipe) => b.created_at.localeCompare(a.created_at);
    }
  };

  const filteredRecipes = createMemo(() => {
    const query = searchQuery();
    const difficulties = difficultyFilter();
    const times = timeFilter();
    const tags = tagFilter();
    const authors = authorFilter();
    const sort = sortBy();

    const baseRecipes =
      query && typeof query === "string" && query.trim()
        ? fuse()
            .search(query.trim())
            .map((result) => result.item)
        : recipes;

    return baseRecipes
      .filter(
        (recipe) =>
          difficulties.length === 0 || difficulties.includes(recipe.difficulty as DifficultyValue),
      )
      .filter((recipe) => {
        if (times.length === 0) {
          return true;
        }
        return times.some((time) => {
          switch (time) {
            case "under30":
              return recipe.total_time < 30;
            case "under60":
              return recipe.total_time < 60;
            case "over60":
              return recipe.total_time >= 60;
            default:
              return true;
          }
        });
      })
      .filter((recipe) => tags.length === 0 || tags.some((tag) => recipe.tags.includes(tag)))
      .filter(
        (recipe) =>
          authors.length === 0 || (recipe.author !== undefined && authors.includes(recipe.author)),
      )
      .filter((recipe) => !favoritesOnly() || favorites.isFavorite(recipe.url_slug))
      .sort(getSortComparator(sort));
  });

  const activeFilterCount = createMemo(
    () =>
      difficultyFilter().length +
      timeFilter().length +
      tagFilter().length +
      authorFilter().length +
      (favoritesOnly() ? 1 : 0),
  );

  const handleFavoritesOnlyChange = (enabled: boolean) => {
    setSearchParams({ ...searchParams, fav: enabled ? "1" : undefined, page: undefined });
  };

  const handleDifficultyFilter = (difficulty: DifficultyFilter) => {
    setSearchParams({
      ...searchParams,
      difficulty: serializeArrayParam(difficulty),
      page: undefined,
    });
  };

  const handleTimeFilter = (time: TimeFilter) => {
    setSearchParams({ ...searchParams, time: serializeArrayParam(time), page: undefined });
  };

  const handleTagFilter = (tag: TagFilter) => {
    setSearchParams({ ...searchParams, tag: serializeArrayParam(tag), page: undefined });
  };

  const handleAuthorFilter = (author: ReadonlyArray<string>) => {
    setSearchParams({ ...searchParams, author: serializeArrayParam(author), page: undefined });
  };

  const handleClearAllFilters = () => {
    setSearchParams({
      ...searchParams,
      difficulty: undefined,
      time: undefined,
      tag: undefined,
      author: undefined,
      fav: undefined,
      page: undefined,
    });
  };

  const handleResetAll = () => {
    setSearchParams({
      ...searchParams,
      q: undefined,
      difficulty: undefined,
      time: undefined,
      tag: undefined,
      author: undefined,
      fav: undefined,
      page: undefined,
    });
  };

  const handleSortChange = (sort: SortValue) => {
    setSearchParams({
      ...searchParams,
      sort: sort !== DEFAULT_SORT ? sort : undefined,
      page: undefined,
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchParams({ ...searchParams, q: query || undefined, page: undefined });
  };

  const handlePageChange = (details: { page: number }) => {
    if (details.page === 1) {
      setSearchParams({ ...searchParams, page: undefined });
    } else {
      setSearchParams({ ...searchParams, page: details.page.toString() });
    }
  };

  return (
    <main class={styles.main}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1 class={styles.title}>{strings.app.title}</h1>
          <p class={styles.subtitle}>The minimalist kitchen collection</p>
        </div>
      </header>
      <div class={styles.container}>
        <div class={styles.layout}>
          <aside class={styles.sidebar} aria-label="Recipe filters">
            <div class={styles.sidebarHeader}>
              <span class={styles.sidebarTitle}>{strings.filterDrawer.title}</span>
              <Show when={activeFilterCount() > 0}>
                <button
                  type="button"
                  class={styles.sidebarClearButton}
                  onClick={handleClearAllFilters}
                >
                  {strings.filterDrawer.clearAll}
                </button>
              </Show>
            </div>
            <FilterPanel
              difficultyFilter={difficultyFilter()}
              timeFilter={timeFilter()}
              tagFilter={tagFilter()}
              authorFilter={authorFilter()}
              authorOptions={authorOptions}
              favoritesOnly={favoritesOnly()}
              onDifficultyChange={handleDifficultyFilter}
              onTimeChange={handleTimeFilter}
              onTagChange={handleTagFilter}
              onAuthorChange={handleAuthorFilter}
              onFavoritesOnlyChange={handleFavoritesOnlyChange}
            />
          </aside>
          <div class={styles.controls}>
            <button
              type="button"
              class={`${styles.filtersButton} ${activeFilterCount() > 0 ? styles.filtersButtonActive : ""}`}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <span class="material-symbols-outlined">tune</span>
              {strings.filterDrawer.filtersButton}
              <Show when={activeFilterCount() > 0}>
                <span class={styles.filterCount}>{activeFilterCount()}</span>
              </Show>
            </button>
            <Show when={activeFilterCount() > 0}>
              <button
                type="button"
                class={styles.clearFiltersButton}
                onClick={handleClearAllFilters}
              >
                <span class="material-symbols-outlined">close</span>
                {strings.filterDrawer.clearAll}
              </button>
            </Show>
            <div class={styles.searchWrapper}>
              <SearchBar
                recipes={recipes}
                searchQuery={(searchQuery() as string) || ""}
                onSearchChange={handleSearchChange}
              />
            </div>
            <SortDropdown value={sortBy()} onSortChange={handleSortChange} />
          </div>
          <div class={styles.mainContent}>
            <RecipeList
              recipes={filteredRecipes()}
              currentPage={currentPage()}
              onPageChange={handlePageChange}
              onResetAll={handleResetAll}
            />
          </div>
        </div>
      </div>

      <FilterDrawer
        open={isFilterDrawerOpen()}
        onOpenChange={setIsFilterDrawerOpen}
        difficultyFilter={difficultyFilter()}
        timeFilter={timeFilter()}
        tagFilter={tagFilter()}
        authorFilter={authorFilter()}
        authorOptions={authorOptions}
        favoritesOnly={favoritesOnly()}
        onDifficultyChange={handleDifficultyFilter}
        onTimeChange={handleTimeFilter}
        onTagChange={handleTagFilter}
        onAuthorChange={handleAuthorFilter}
        onFavoritesOnlyChange={handleFavoritesOnlyChange}
        onClearAll={handleClearAllFilters}
      />
    </main>
  );
};

export default Home;
