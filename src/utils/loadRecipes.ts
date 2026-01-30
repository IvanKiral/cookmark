import type { Recipe, RecipeData } from "~/types/Recipe";

const FALLBACK_CREATED_AT = "1970-01-01T00:00:00.000Z";

const recipeModules = import.meta.glob<RecipeData>("../../data/*.json", {
  eager: true,
  import: "default",
});

const extractSlugFromPath = (filePath: string): string => {
  const filename = filePath.split("/").pop() || "";
  return filename.replace(".json", "");
};

const capitalizeFirstLetter = (str: string | null): string => {
  if (!str) {
    return "Unknown";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const transformRecipeData = (data: RecipeData, filePath: string, index: number): Recipe => ({
  id: (index + 1).toString(),
  url_slug: extractSlugFromPath(filePath),
  name: data.title,
  difficulty: capitalizeFirstLetter(data.difficulty) as "Easy" | "Medium" | "Hard" | "Unknown",
  time: data.total_time ? `${data.total_time} min` : "N/A",
  total_time: data.total_time || 0,
  tags: data.tags || [],
  created_at: data.created_at || FALLBACK_CREATED_AT,
});

export const loadRecipes = (): Recipe[] =>
  Object.entries(recipeModules).map(([path, data], index) =>
    transformRecipeData(data, path, index),
  );

export const getRecipeDataById = (id: string): RecipeData | undefined => {
  const recipeArray = Object.values(recipeModules);
  const index = parseInt(id, 10) - 1;
  return recipeArray[index];
};

export const getRecipeDataBySlug = (slug: string): RecipeData | undefined => {
  const recipeEntries = Object.entries(recipeModules);
  const entry = recipeEntries.find(([path]) => extractSlugFromPath(path) === slug);
  return entry ? entry[1] : undefined;
};

export const getRecipeIdBySlug = (slug: string): string | undefined => {
  const recipeEntries = Object.entries(recipeModules);
  const index = recipeEntries.findIndex(([path]) => extractSlugFromPath(path) === slug);
  return index !== -1 ? (index + 1).toString() : undefined;
};
