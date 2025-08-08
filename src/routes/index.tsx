import { createSignal } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import RecipeDrawer from "~/components/RecipeDrawer/RecipeDrawer";
import FilterSidebar from "~/components/FilterSidebar/FilterSidebar";
import SortDropdown from "~/components/SortDropdown/SortDropdown";
import { loadRecipes } from "~/utils/loadRecipes";
import { type SortValue } from "~/constants/sortOptions";
import styles from "./index.module.css";

export default function Home() {
  const recipes: Recipe[] = loadRecipes();

  const [filteredRecipes, setFilteredRecipes] =
    createSignal<ReadonlyArray<Recipe>>(recipes);
  const [searchFilteredRecipes, setSearchFilteredRecipes] =
    createSignal<ReadonlyArray<Recipe>>(recipes);
  const [difficultyFilter, setDifficultyFilter] = createSignal<string | null>(
    null,
  );
  const [timeFilter, setTimeFilter] = createSignal<string | null>(null);
  const [sortBy, setSortBy] = createSignal<SortValue>("name-asc");
  const [selectedRecipeId, setSelectedRecipeId] = createSignal<string | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

  const handleRecipeSelect = (id: string) => {
    setSelectedRecipeId(id);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRecipeId(null);
  };

  const handleSearchResults = (results: ReadonlyArray<Recipe>) => {
    setSearchFilteredRecipes(results);
    applyFiltersAndSort(results, difficultyFilter(), timeFilter(), sortBy());
  };

  const handleDifficultyFilter = (difficulty: string | null) => {
    setDifficultyFilter(difficulty);
    applyFiltersAndSort(
      searchFilteredRecipes(),
      difficulty,
      timeFilter(),
      sortBy(),
    );
  };

  const handleTimeFilter = (time: string | null) => {
    setTimeFilter(time);
    applyFiltersAndSort(
      searchFilteredRecipes(),
      difficultyFilter(),
      time,
      sortBy(),
    );
  };

  const handleSortChange = (sort: SortValue) => {
    setSortBy(sort);
    applyFiltersAndSort(
      searchFilteredRecipes(),
      difficultyFilter(),
      timeFilter(),
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
      case "difficulty-easy":
        const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
        return sorted.sort(
          (a, b) =>
            difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
        );
      case "difficulty-hard":
        const difficultyOrderReverse = { Hard: 0, Medium: 1, Easy: 2 };
        return sorted.sort(
          (a, b) =>
            difficultyOrderReverse[a.difficulty] -
            difficultyOrderReverse[b.difficulty],
        );
      default:
        return sorted;
    }
  };

  const applyFiltersAndSort = (
    searchResults: ReadonlyArray<Recipe>,
    difficulty: string | null,
    time: string | null,
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
        createTimePredicate(recipe, time)
      );
    });

    const sorted = sortRecipes(Array.from(filtered), sort);
    setFilteredRecipes(sorted);
  };

  return (
    <main class={styles.main}>
      <header class={styles.header}>
        <h1 class={styles.title}>Recipe Book</h1>
      </header>
      <div class={styles.container}>
        <div class={styles.layout}>
          <FilterSidebar
            onFilterChange={handleDifficultyFilter}
            onTimeFilterChange={handleTimeFilter}
          />
          <div class={styles.mainContent}>
            <div class={styles.searchAndSort}>
              <SearchBar
                recipes={recipes}
                onSearchResults={handleSearchResults}
              />
              <SortDropdown value={sortBy()} onSortChange={handleSortChange} />
            </div>
            <RecipeList
              recipes={filteredRecipes()}
              onRecipeSelect={handleRecipeSelect}
            />
          </div>
        </div>
      </div>

      <RecipeDrawer
        open={isDrawerOpen()}
        onOpenChange={setIsDrawerOpen}
        recipeId={selectedRecipeId()}
        onClose={handleDrawerClose}
      />
    </main>
  );
}
