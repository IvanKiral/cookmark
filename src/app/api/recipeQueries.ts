import { query, revalidate } from "@solidjs/router";
import type { Recipe, RecipeData } from "~/shared/recipe.ts";

// The server modules are imported inside the "use server" functions, so none
// of their code (D1 access, the dev-only wrangler setup) reaches the client.
export const getRecipesList = query(async (): Promise<Recipe[]> => {
  "use server";
  const { loadRecipesFromSource } = await import("~/server/recipes/recipeSource.ts");
  return loadRecipesFromSource();
}, "recipes-list");

export const getRecipeBySlug = query(async (slug: string): Promise<RecipeData | undefined> => {
  "use server";
  const { loadRecipeDataFromSource } = await import("~/server/recipes/recipeSource.ts");
  return loadRecipeDataFromSource(slug);
}, "recipe-by-slug");

// Refetches both queries after an admin change, so the list and the recipe
// page show it right away.
export const revalidateRecipes = (): Promise<void> =>
  revalidate([getRecipesList.key, getRecipeBySlug.key]);
