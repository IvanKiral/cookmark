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
const readRecipesFromDb = async (db: D1Database): Promise<Recipe[] | undefined> => {
  try {
    const { results } = await db
      .prepare("SELECT slug, data FROM recipes")
      .all<{ slug: string; data: string }>();
    if (results.length === 0) {
      return undefined;
    }
    return results.map((row, index) =>
      transformRecipeData(JSON.parse(row.data) as RecipeData, row.slug, index),
    );
  } catch {
    return undefined;
  }
};

const readRecipeFromDb = async (db: D1Database, slug: string): Promise<RecipeData | undefined> => {
  try {
    const row = await db
      .prepare("SELECT data FROM recipes WHERE slug = ?")
      .bind(slug)
      .first<{ data: string }>();
    return row ? (JSON.parse(row.data) as RecipeData) : undefined;
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
