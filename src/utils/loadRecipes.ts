import type { Recipe, RecipeData } from "~/types/Recipe.ts";
import { getRecipeImageUrl } from "~/utils/recipeImage.ts";

// Injected at build time (see app.config.ts) with the slugs that have a video.
declare const __VIDEO_SLUGS__: ReadonlyArray<string>;

const videoSlugs = new Set<string>(__VIDEO_SLUGS__);

const FALLBACK_CREATED_AT = "1970-01-01T00:00:00.000Z";

// Local bundle of recipes, used as a fallback when the R2 binding is absent
// (e.g. `pnpm dev` and static prerender builds).
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

export const transformRecipeData = (data: RecipeData, slug: string, index: number): Recipe => ({
  id: (index + 1).toString(),
  url_slug: slug,
  name: data.title,
  description: data.description || "",
  difficulty: capitalizeFirstLetter(data.difficulty) as "Easy" | "Medium" | "Hard" | "Unknown",
  time: data.total_time ? `${data.total_time} min` : "N/A",
  total_time: data.total_time || 0,
  tags: data.tags || [],
  ingredients: (data.ingredients || []).map((ingredient) => ingredient.name),
  author: data.author,
  image_url: getRecipeImageUrl(data, slug),
  created_at: data.created_at || FALLBACK_CREATED_AT,
});

export const bundleRecipes = (): Recipe[] =>
  Object.entries(recipeModules).map(([path, data], index) =>
    transformRecipeData(data, extractSlugFromPath(path), index),
  );

export const bundleRecipeData = (slug: string): RecipeData | undefined => {
  const entry = Object.entries(recipeModules).find(([path]) => extractSlugFromPath(path) === slug);
  return entry?.[1];
};

export const bundleHasVideo = (slug: string): boolean => videoSlugs.has(slug);
