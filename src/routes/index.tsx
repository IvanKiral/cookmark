import { createSignal } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import RecipeDrawer from "~/components/RecipeDrawer/RecipeDrawer";
import FilterSidebar from "~/components/FilterSidebar/FilterSidebar";
import { loadRecipes } from "~/utils/loadRecipes";
import styles from "./index.module.css";

export default function Home() {
  const recipes: Recipe[] = loadRecipes();

  const [filteredRecipes, setFilteredRecipes] = createSignal<Recipe[]>(recipes);
  const [searchFilteredRecipes, setSearchFilteredRecipes] =
    createSignal<ReadonlyArray<Recipe>>(recipes);
  const [difficultyFilter, setDifficultyFilter] = createSignal<string | null>(
    null,
  );
  const [timeFilter, setTimeFilter] = createSignal<string | null>(null);
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
    applyFilters(results, difficultyFilter(), timeFilter());
  };

  const handleDifficultyFilter = (difficulty: string | null) => {
    setDifficultyFilter(difficulty);
    applyFilters(searchFilteredRecipes(), difficulty, timeFilter());
  };

  const handleTimeFilter = (time: string | null) => {
    setTimeFilter(time);
    applyFilters(searchFilteredRecipes(), difficultyFilter(), time);
  };

  const applyFilters = (
    searchResults: ReadonlyArray<Recipe>,
    difficulty: string | null,
    time: string | null,
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

    setFilteredRecipes(
      searchResults.filter((recipe) => {
        return (
          (!difficulty || recipe.difficulty === difficulty) &&
          createTimePredicate(recipe, time)
        );
      }),
    );
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
            <SearchBar
              recipes={recipes}
              onSearchResults={handleSearchResults}
            />
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
