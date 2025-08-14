import { useParams, useSearchParams } from "@solidjs/router";
import { createMemo, createSignal } from "solid-js";
import FilterSidebar from "~/components/FilterSidebar/FilterSidebar";
import RecipeDrawer from "~/components/RecipeDrawer/RecipeDrawer";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import SortDropdown from "~/components/SortDropdown/SortDropdown";
import type { SortValue } from "~/constants/sortOptions";
import type { TagFilter } from "~/constants/tagOptions";
import type { Locale } from "~/i18n";
import { I18nProvider, useT } from "~/lib/i18nContext";
import type { Recipe } from "~/types/Recipe";
import { loadRecipes } from "~/utils/loadRecipes";
import styles from "./index.module.css";

function Home() {
  const t = useT();
  const recipes: Recipe[] = loadRecipes();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredRecipes, setFilteredRecipes] = createSignal<ReadonlyArray<Recipe>>(recipes);
  const [searchFilteredRecipes, setSearchFilteredRecipes] =
    createSignal<ReadonlyArray<Recipe>>(recipes);
  const [difficultyFilter, setDifficultyFilter] = createSignal<string | null>(null);
  const [timeFilter, setTimeFilter] = createSignal<string | null>(null);
  const [tagFilter, setTagFilter] = createSignal<TagFilter>(null);
  const [sortBy, setSortBy] = createSignal<SortValue>("name-asc");

  // Derive selected recipe from URL
  const selectedRecipeId = createMemo(() => {
    const slug = searchParams.recipe;
    if (!slug) {
      return null;
    }
    const recipe = recipes.find((r) => r.url_slug === slug);
    return recipe?.id ?? null;
  });

  // Drawer is open when recipe is selected
  const isDrawerOpen = createMemo(() => selectedRecipeId() !== null);

  const handleRecipeSelect = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setSearchParams({ recipe: recipe.url_slug });
    }
  };

  const handleDrawerClose = () => {
    setSearchParams({ recipe: undefined });
  };

  const handleSearchResults = (results: ReadonlyArray<Recipe>) => {
    setSearchFilteredRecipes(results);
    applyFiltersAndSort(results, difficultyFilter(), timeFilter(), tagFilter(), sortBy());
  };

  const handleDifficultyFilter = (difficulty: string | null) => {
    setDifficultyFilter(difficulty);
    applyFiltersAndSort(searchFilteredRecipes(), difficulty, timeFilter(), tagFilter(), sortBy());
  };

  const handleTimeFilter = (time: string | null) => {
    setTimeFilter(time);
    applyFiltersAndSort(searchFilteredRecipes(), difficultyFilter(), time, tagFilter(), sortBy());
  };

  const handleTagFilter = (tag: TagFilter) => {
    setTagFilter(tag);
    applyFiltersAndSort(searchFilteredRecipes(), difficultyFilter(), timeFilter(), tag, sortBy());
  };

  const handleSortChange = (sort: SortValue) => {
    setSortBy(sort);
    applyFiltersAndSort(
      searchFilteredRecipes(),
      difficultyFilter(),
      timeFilter(),
      tagFilter(),
      sort,
    );
  };

  const sortRecipes = (
    recipes: ReadonlyArray<Recipe>,
    sortBy: SortValue,
  ): ReadonlyArray<Recipe> => {
    const sorted = [...recipes];

    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "time-asc":
        return sorted.sort((a, b) => a.total_time - b.total_time);
      case "time-desc":
        return sorted.sort((a, b) => b.total_time - a.total_time);
      case "difficulty-easy": {
        const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
        return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      }
      case "difficulty-hard": {
        const difficultyOrderReverse = { Hard: 0, Medium: 1, Easy: 2 };
        return sorted.sort(
          (a, b) => difficultyOrderReverse[a.difficulty] - difficultyOrderReverse[b.difficulty],
        );
      }
      default:
        return sorted;
    }
  };

  const applyFiltersAndSort = (
    searchResults: ReadonlyArray<Recipe>,
    difficulty: string | null,
    time: string | null,
    tag: TagFilter,
    sort: SortValue,
  ) => {
    const createTimePredicate = (recipe: Recipe, time: string | null) => {
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
    };

    const filtered = searchResults.filter((recipe) => {
      return (
        (!difficulty || recipe.difficulty === difficulty) &&
        createTimePredicate(recipe, time) &&
        (!tag || recipe.tags.includes(tag))
      );
    });

    const sorted = sortRecipes(Array.from(filtered), sort);
    setFilteredRecipes(sorted);
  };

  return (
    <main class={styles.main}>
      <header class={styles.header}>
        <h1 class={styles.title}>{t.app.title}</h1>
      </header>
      <div class={styles.container}>
        <div class={styles.layout}>
          <FilterSidebar
            onFilterChange={handleDifficultyFilter}
            onTimeFilterChange={handleTimeFilter}
            onTagFilterChange={handleTagFilter}
          />
          <div class={styles.mainContent}>
            <div class={styles.searchAndSort}>
              <SearchBar recipes={recipes} onSearchResults={handleSearchResults} />
              <SortDropdown value={sortBy()} onSortChange={handleSortChange} />
            </div>
            <RecipeList recipes={filteredRecipes()} onRecipeSelect={handleRecipeSelect} />
          </div>
        </div>
      </div>

      <RecipeDrawer
        open={isDrawerOpen()}
        onOpenChange={(open: boolean) => {
          if (!open) {
            handleDrawerClose();
          }
        }}
        recipeId={selectedRecipeId()}
        onClose={handleDrawerClose}
      />
    </main>
  );
}

export default function LangLayout() {
  const params = useParams<{ lang: Locale }>();
  return (
    <I18nProvider locale={params.lang}>
      <Home />
    </I18nProvider>
  );
}
