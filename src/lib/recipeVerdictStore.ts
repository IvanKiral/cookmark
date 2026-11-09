import type { APIEvent } from "@solidjs/start/server";
import { isRecipeVerdict, type RecipeVerdict } from "~/constants/recipeVerdicts.ts";
import { requireRole } from "~/lib/requireRole.ts";

type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  run: () => Promise<{ meta: { changes: number } }>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type RecipeVerdictEnv = {
  RECIPES?: D1Database;
};

const getRecipeVerdictDb = (): D1Database | undefined =>
  (globalThis as unknown as { __env__?: RecipeVerdictEnv }).__env__?.RECIPES;

// A plain UPDATE of the one column, so the recipe data itself is never touched.
// Setting a verdict replaces the previous one; null clears it. Returns false
// when no recipe has this slug.
export const setRecipeVerdict = async (
  db: D1Database,
  slug: string,
  verdict: RecipeVerdict | null,
): Promise<boolean> => {
  const result = await db
    .prepare("UPDATE recipes SET verdict = ? WHERE slug = ?")
    .bind(verdict, slug)
    .run();
  return result.meta.changes > 0;
};

const readVerdict = async (request: Request): Promise<RecipeVerdict | undefined> => {
  try {
    const body: unknown = await request.json();
    const verdict = (body as { verdict?: unknown } | null)?.verdict;
    return isRecipeVerdict(verdict) ? verdict : undefined;
  } catch {
    return undefined;
  }
};

const respondToVerdictChange = async (
  event: APIEvent,
  getVerdict: () => Promise<RecipeVerdict | null | undefined>,
): Promise<Response> => {
  const check = await requireRole(event.request, "admin");
  if (!check.isAllowed) {
    return check.response;
  }
  const db = getRecipeVerdictDb();
  if (!db) {
    return new Response("Recipes unavailable", { status: 500 });
  }
  const verdict = await getVerdict();
  if (verdict === undefined) {
    return new Response("Invalid verdict", { status: 400 });
  }
  const isUpdated = await setRecipeVerdict(db, event.params.slug, verdict);
  if (!isUpdated) {
    return new Response("Recipe not found", { status: 404 });
  }
  return new Response(null, { status: 204 });
};

// PUT body: { "verdict": RecipeVerdict }, e.g. { "verdict": "chef-kiss" }
export const handleSetRecipeVerdict = (event: APIEvent): Promise<Response> =>
  respondToVerdictChange(event, () => readVerdict(event.request));

export const handleClearRecipeVerdict = (event: APIEvent): Promise<Response> =>
  respondToVerdictChange(event, async () => null);
