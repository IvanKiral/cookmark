import { createSignal } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import { loadRecipes } from "~/utils/loadRecipes";
import styles from "./index.module.css";

export default function Home() {
  const recipes: Recipe[] = loadRecipes();

  const [filteredRecipes, setFilteredRecipes] = createSignal<Recipe[]>(recipes);

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
          <RecipeList recipes={filteredRecipes()} />
        </div>
      </div>
    </main>
  );
}
