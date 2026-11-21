import { getEnv } from "~/server/env.ts";
import type { Recipe, RecipeSummary } from "~/shared/recipe.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import { toRecipeSummary } from "./toRecipeSummary.ts";

type RecipeRow = {
  slug: string;
  data: string;
  verdict: RecipeVerdict | null;
  should_delete: number;
};

// The flag columns win over anything in the source JSON.
const toRecipe = (row: Omit<RecipeRow, "slug">): Recipe => ({
  ...(JSON.parse(row.data) as Recipe),
  verdict: row.verdict ?? undefined,
  should_delete: row.should_delete === 1,
});

const getRecipesDb = (): D1Database => {
  const db = getEnv().RECIPES;
  if (!db) {
    throw new Error("The RECIPES database binding is missing");
  }
  return db;
};

export const loadRecipesFromSource = async (): Promise<RecipeSummary[]> => {
  const { results } = await getRecipesDb()
    .prepare("SELECT slug, data, verdict, should_delete FROM recipes")
    .all<RecipeRow>();
  return results.map((row) => toRecipeSummary(toRecipe(row), row.slug));
};

const hasVideo = async (slug: string): Promise<boolean> => {
  const media = getEnv().MEDIA;
  if (!media) {
    return false;
  }
  return (await media.head(`videos/${slug}.mp4`)) !== null;
};

export const loadRecipeDataFromSource = async (slug: string): Promise<Recipe | undefined> => {
  const row = await getRecipesDb()
    .prepare("SELECT data, verdict, should_delete FROM recipes WHERE slug = ?")
    .bind(slug)
    .first<Omit<RecipeRow, "slug">>();
  if (!row) {
    return undefined;
  }
  const data = toRecipe(row);
  return (await hasVideo(slug)) ? { ...data, video_url: `/media/${slug}` } : data;
};
