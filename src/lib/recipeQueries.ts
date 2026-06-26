import { query } from "@solidjs/router";
import type { Recipe, RecipeData } from "~/types/Recipe.ts";

// recipeSource is imported dynamically so its bundled-recipe fallback (the
// data/*.json glob) stays out of the client bundle.
export const getRecipesList = query(async (): Promise<Recipe[]> => {
  "use server";
  const { loadRecipesFromSource } = await import("~/lib/recipeSource.ts");
  return loadRecipesFromSource();
}, "recipes-list");

export const getRecipeBySlug = query(async (slug: string): Promise<RecipeData | undefined> => {
  "use server";
  const { loadRecipeDataFromSource } = await import("~/lib/recipeSource.ts");
  return loadRecipeDataFromSource(slug);
}, "recipe-by-slug");
