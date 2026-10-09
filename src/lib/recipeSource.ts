import type { Recipe, RecipeData } from "~/types/Recipe.ts";
import {
  bundleHasVideo,
  bundleRecipeData,
  bundleRecipes,
  transformRecipeData,
} from "~/utils/loadRecipes.ts";

type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  all: <T>() => Promise<{ results: ReadonlyArray<T> }>;
  first: <T>() => Promise<T | null>;
};

type RecipeRow = {
  slug: string;
  data: string;
  is_chef_pick: number;
  should_delete: number;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type R2Bucket = {
  head: (key: string) => Promise<unknown | null>;
};

type SourceEnv = {
  RECIPES?: D1Database;
  MEDIA?: R2Bucket;
};

const getEnv = (): SourceEnv => (globalThis as unknown as { __env__?: SourceEnv }).__env__ ?? {};

// D1 reads can throw (e.g. missing table in an unseeded local dev DB), so any
// failure falls back to the bundled recipes rather than crashing the render.
// The flag columns win over anything in the source JSON.
const toRecipeData = (row: Omit<RecipeRow, "slug">): RecipeData => ({
  ...(JSON.parse(row.data) as RecipeData),
  is_chef_pick: row.is_chef_pick === 1,
  should_delete: row.should_delete === 1,
});

const readRecipesFromDb = async (db: D1Database): Promise<Recipe[] | undefined> => {
  try {
    const { results } = await db
      .prepare("SELECT slug, data, is_chef_pick, should_delete FROM recipes")
      .all<RecipeRow>();
    if (results.length === 0) {
      return undefined;
    }
    return results.map((row, index) => transformRecipeData(toRecipeData(row), row.slug, index));
  } catch {
    return undefined;
  }
};

const readRecipeFromDb = async (db: D1Database, slug: string): Promise<RecipeData | undefined> => {
  try {
    const row = await db
      .prepare("SELECT data, is_chef_pick, should_delete FROM recipes WHERE slug = ?")
      .bind(slug)
      .first<Omit<RecipeRow, "slug">>();
    return row ? toRecipeData(row) : undefined;
  } catch {
    return undefined;
  }
};

export const loadRecipesFromSource = async (): Promise<Recipe[]> => {
  const db = getEnv().RECIPES;
  const fromDb = db ? await readRecipesFromDb(db) : undefined;
  return fromDb ?? bundleRecipes();
};

export const loadRecipeDataFromSource = async (slug: string): Promise<RecipeData | undefined> => {
  const env = getEnv();
  const fromDb = env.RECIPES ? await readRecipeFromDb(env.RECIPES, slug) : undefined;
  const data = fromDb ?? bundleRecipeData(slug);
  if (!data) {
    return undefined;
  }
  const hasVideo = env.MEDIA
    ? (await env.MEDIA.head(`videos/${slug}.mp4`)) !== null
    : bundleHasVideo(slug);
  return hasVideo ? { ...data, video_url: `/media/${slug}` } : data;
};
