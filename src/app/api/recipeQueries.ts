import { query, revalidate } from "@solidjs/router";
import type { Recipe, RecipeSummary } from "~/shared/recipe.ts";

// The server modules are imported inside the "use server" functions, so none
// of their code (D1 access, the Worker bindings) reaches the client.
export const getRecipesList = query(async (): Promise<RecipeSummary[]> => {
  "use server";
  const { loadRecipesFromSource } = await import("~/server/recipes/recipeSource.ts");
  return loadRecipesFromSource();
}, "recipes-list");

export const getRecipeBySlug = query(async (slug: string): Promise<Recipe | undefined> => {
  "use server";
  const { loadRecipeDataFromSource } = await import("~/server/recipes/recipeSource.ts");
  return loadRecipeDataFromSource(slug);
}, "recipe-by-slug");

// Refetches both queries after an admin change, so the list and the recipe
// page show it right away. Called inside an action, the refetch joins the
// action's transaction, so optimistic values hold until the new data lands.
export const revalidateRecipes = (): void => {
  revalidate([getRecipesList.key, getRecipeBySlug.key]);
};
