import { createSignal } from "solid-js";
import type { Recipe } from "~/types/Recipe";
import RecipeList from "~/components/RecipeList/RecipeList";
import SearchBar from "~/components/SearchBar/SearchBar";
import { loadRecipes } from "~/utils/loadRecipes";

export default function Home() {
  const recipes: Recipe[] = loadRecipes();

  const [filteredRecipes, setFilteredRecipes] = createSignal<Recipe[]>(recipes);

  return (
    <main class="mx-auto font-[Gordita,Roboto,Oxygen,Ubuntu,Cantarell,'Open_Sans','Helvetica_Neue',sans-serif] bg-neutral-100 min-h-screen">
      <header class="w-full text-center py-16 bg-primary-300">
        <h1 class="text-neutral-900 uppercase text-[4rem]  leading-tight">
          Recipe Book
        </h1>
      </header>
      <div class="container mx-auto px-40">
        <div class="w-full flex flex-col items-center">
          <SearchBar recipes={recipes} onSearchResults={setFilteredRecipes} />
          <RecipeList recipes={filteredRecipes()} />
        </div>
      </div>
    </main>
  );
}
