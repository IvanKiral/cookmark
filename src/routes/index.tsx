import { createSignal } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import RecipeDrawer from "~/components/RecipeDrawer/RecipeDrawer";
import { loadRecipes } from "~/utils/loadRecipes";
import styles from "./index.module.css";

export default function Home() {
  const recipes: Recipe[] = loadRecipes();

  const [filteredRecipes, setFilteredRecipes] = createSignal<Recipe[]>(recipes);
  const [selectedRecipeId, setSelectedRecipeId] = createSignal<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = createSignal(false);

  const handleRecipeSelect = (id: string) => {
    setSelectedRecipeId(id);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRecipeId(null);
  };

  return (
    <main class={styles.main}>
      <header class={styles.header}>
        <h1 class={styles.title}>
          Recipe Book
        </h1>
      </header>
      <div class={styles.container}>
        <div class={styles.content}>
          <SearchBar recipes={recipes} onSearchResults={setFilteredRecipes} />
          <RecipeList recipes={filteredRecipes()} onRecipeSelect={handleRecipeSelect} />
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
