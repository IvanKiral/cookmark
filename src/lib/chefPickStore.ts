import type { APIEvent } from "@solidjs/start/server";
import { requireRole } from "~/lib/requireRole.ts";

type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  run: () => Promise<{ meta: { changes: number } }>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type ChefPickEnv = {
  RECIPES?: D1Database;
};

const getChefPickDb = (): D1Database | undefined =>
  (globalThis as unknown as { __env__?: ChefPickEnv }).__env__?.RECIPES;

// A plain UPDATE of the one column, so the recipe data itself is never touched.
// Returns false when no recipe has this slug.
export const setChefPick = async (
  db: D1Database,
  slug: string,
  isChefPick: boolean,
): Promise<boolean> => {
  const result = await db
    .prepare("UPDATE recipes SET is_chef_pick = ? WHERE slug = ?")
    .bind(isChefPick ? 1 : 0, slug)
    .run();
  return result.meta.changes > 0;
};

export const createSetChefPickHandler =
  (isChefPick: boolean) =>
  async (event: APIEvent): Promise<Response> => {
    const check = await requireRole(event.request, "admin");
    if (!check.isAllowed) {
      return check.response;
    }
    const db = getChefPickDb();
    if (!db) {
      return new Response("Recipes unavailable", { status: 500 });
    }
    const isUpdated = await setChefPick(db, event.params.slug, isChefPick);
    if (!isUpdated) {
      return new Response("Recipe not found", { status: 404 });
    }
    return new Response(null, { status: 204 });
  };
