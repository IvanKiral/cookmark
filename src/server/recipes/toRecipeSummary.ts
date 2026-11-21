import type { Recipe, RecipeSummary } from "~/shared/recipe.ts";
import { getRecipeImageUrl } from "~/shared/recipeImage.ts";

const FALLBACK_CREATED_AT = "1970-01-01T00:00:00.000Z";

const capitalizeFirstLetter = (str: string | null): string => {
  if (!str) {
    return "Unknown";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toRecipeSummary = (data: Recipe, slug: string): RecipeSummary => ({
  url_slug: slug,
  name: data.title,
  description: data.description || "",
  difficulty: capitalizeFirstLetter(data.difficulty) as "Easy" | "Medium" | "Hard" | "Unknown",
  total_time: data.total_time || 0,
  tags: data.tags || [],
  ingredients: (data.ingredients || []).map((ingredient) => ingredient.name),
  author: data.author,
  image_url: getRecipeImageUrl(data, slug),
  created_at: data.created_at || FALLBACK_CREATED_AT,
  verdict: data.verdict,
});
