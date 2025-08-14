import type { Recipe, RecipeData } from "~/types/Recipe";
import { generateSlug } from "./generateSlug.js";

// Import all recipe JSON files using Vite's glob import
const recipeModules = import.meta.glob<RecipeData>("../../data/sk/*.json", {
  eager: true,
  import: "default",
});

const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const transformRecipeData = (data: RecipeData, index: number): Recipe => {
  return {
    id: (index + 1).toString(),
    url_slug: generateSlug(data.title),
    name: data.title,
    difficulty: capitalizeFirstLetter(data.difficulty) as "Easy" | "Medium" | "Hard",
    time: data.total_time ? `${data.total_time} min` : "N/A",
    total_time: data.total_time || 0,
    tags: data.tags || [],
  };
};

export const loadRecipes = (): Recipe[] => {
  return Object.entries(recipeModules).map(([_path, data], index) =>
    transformRecipeData(data, index),
  );
};

export const getRecipeDataById = (id: string): RecipeData | undefined => {
  const recipeArray = Object.values(recipeModules);
  const index = parseInt(id, 10) - 1;
  return recipeArray[index];
};

export const getRecipeDataBySlug = (slug: string): RecipeData | undefined => {
  const recipeEntries = Object.entries(recipeModules);
  const entry = recipeEntries.find(([_path, data]) => generateSlug(data.title) === slug);
  return entry ? entry[1] : undefined;
};

export const getRecipeIdBySlug = (slug: string): string | undefined => {
  const recipeEntries = Object.entries(recipeModules);
  const index = recipeEntries.findIndex(([_path, data]) => generateSlug(data.title) === slug);
  return index !== -1 ? (index + 1).toString() : undefined;
};
