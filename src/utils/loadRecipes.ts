import type { Recipe, RecipeData } from "~/types/Recipe";

// Import all recipe JSON files using Vite's glob import
const recipeModules = import.meta.glob<RecipeData>("../../data/*.json", {
  eager: true,
  import: "default",
});

const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const transformRecipeData = (data: RecipeData, index: number): Recipe => {
  return {
    id: (index + 1).toString(),
    name: data.title,
    difficulty: capitalizeFirstLetter(data.difficulty) as
      | "Easy"
      | "Medium"
      | "Hard",
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
  const index = parseInt(id) - 1;
  return recipeArray[index];
};
