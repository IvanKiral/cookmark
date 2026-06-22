import type { Recipe, RecipeData } from "~/types/Recipe.ts";

// Injected at build time (see app.config.ts) with the slugs that have a video.
declare const __VIDEO_SLUGS__: ReadonlyArray<string>;

const videoSlugs = new Set<string>(__VIDEO_SLUGS__);

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
  description: data.description || "",
  difficulty: capitalizeFirstLetter(data.difficulty) as "Easy" | "Medium" | "Hard" | "Unknown",
  time: data.total_time ? `${data.total_time} min` : "N/A",
  total_time: data.total_time || 0,
  tags: data.tags || [],
  ingredients: (data.ingredients || []).map((ingredient) => ingredient.name),
  author: data.author,
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
  if (!entry) {
    return undefined;
  }
  // Point at the same-origin streaming route only when a video exists.
  return videoSlugs.has(slug) ? { ...entry[1], video_url: `/media/${slug}` } : entry[1];
};

export const getRecipeIdBySlug = (slug: string): string | undefined => {
  const recipeEntries = Object.entries(recipeModules);
  const index = recipeEntries.findIndex(([path]) => extractSlugFromPath(path) === slug);
  return index !== -1 ? (index + 1).toString() : undefined;
};
