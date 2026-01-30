import { useSearchParams } from "@solidjs/router";
import Fuse from "fuse.js";
import { createMemo, createSignal, Show } from "solid-js";
import FilterDrawer from "~/components/FilterDrawer/FilterDrawer";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import SortDropdown from "~/components/SortDropdown/SortDropdown";
import {
  type DifficultyFilter,
  type DifficultyValue,
  difficultyValues,
} from "~/constants/difficultyOptions";
import { DEFAULT_SORT, type SortValue, sortValues } from "~/constants/sortOptions";
import { strings } from "~/constants/strings";
import { type TagFilter, type TagValue, tagValues } from "~/constants/tagOptions";
import { type TimeFilter, type TimeValue, timeValues } from "~/constants/timeOptions";
import type { Recipe } from "~/types/Recipe";
import { loadRecipes } from "~/utils/loadRecipes";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = createSignal(false);

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
          { name: "name", weight: 0.7 },
          { name: "difficulty", weight: 0.2 },
          { name: "time", weight: 0.1 },
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
      .sort(getSortComparator(sort));
  });

  const activeFilterCount = createMemo(
    () => difficultyFilter().length + timeFilter().length + tagFilter().length,
  );

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

  const handleClearAllFilters = () => {
    setSearchParams({
      ...searchParams,
      difficulty: undefined,
      time: undefined,
      tag: undefined,
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
        onDifficultyChange={handleDifficultyFilter}
        onTimeChange={handleTimeFilter}
        onTagChange={handleTagFilter}
        onClearAll={handleClearAllFilters}
      />
    </main>
  );
};

export default Home;
