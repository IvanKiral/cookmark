import { normalizeEmail } from "~/lib/userStore.ts";

type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<{ results: ReadonlyArray<T> }>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

// Per-user recipe marks live in the recipes database, next to users.
type MarksEnv = {
  RECIPES?: D1Database;
};

export type Mark = "favorite";

export const getMarksDb = (): D1Database | undefined =>
  (globalThis as unknown as { __env__?: MarksEnv }).__env__?.RECIPES;

export const readMarkedSlugs = async (
  db: D1Database,
  email: string,
  mark: Mark,
): Promise<ReadonlyArray<string>> => {
  const { results } = await db
    .prepare(
      "SELECT slug FROM user_recipe_marks WHERE email = ? AND mark = ? ORDER BY created_at ASC",
    )
    .bind(normalizeEmail(email), mark)
    .all<{ slug: string }>();
  return results.map((row) => row.slug);
};

// The user row must exist first (email references users).
export const addMark = async (
  db: D1Database,
  email: string,
  slug: string,
  mark: Mark,
  now: string,
): Promise<void> => {
  await db
    .prepare(
      "INSERT INTO user_recipe_marks (email, slug, mark, created_at) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
    )
    .bind(normalizeEmail(email), slug, mark, now)
    .run();
};

export const removeMark = async (
  db: D1Database,
  email: string,
  slug: string,
  mark: Mark,
): Promise<void> => {
  await db
    .prepare("DELETE FROM user_recipe_marks WHERE email = ? AND slug = ? AND mark = ?")
    .bind(normalizeEmail(email), slug, mark)
    .run();
};
