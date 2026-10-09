import type { APIEvent } from "@solidjs/start/server";
import type { RecipeFlag } from "~/constants/recipeFlags.ts";
import { requireRole } from "~/lib/requireRole.ts";

type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  run: () => Promise<{ meta: { changes: number } }>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type RecipeFlagEnv = {
  RECIPES?: D1Database;
};

// Column names can't be bound as parameters, so they only ever come from here.
const flagColumns: Record<RecipeFlag, string> = {
  "chef-pick": "is_chef_pick",
  "should-delete": "should_delete",
};

const getRecipeFlagDb = (): D1Database | undefined =>
  (globalThis as unknown as { __env__?: RecipeFlagEnv }).__env__?.RECIPES;

// A plain UPDATE of the one column, so the recipe data itself is never touched.
// Returns false when no recipe has this slug.
export const setRecipeFlag = async (
  db: D1Database,
  slug: string,
  flag: RecipeFlag,
  isSet: boolean,
): Promise<boolean> => {
  const result = await db
    .prepare(`UPDATE recipes SET ${flagColumns[flag]} = ? WHERE slug = ?`)
    .bind(isSet ? 1 : 0, slug)
    .run();
  return result.meta.changes > 0;
};

export const createSetRecipeFlagHandler =
  (flag: RecipeFlag, isSet: boolean) =>
  async (event: APIEvent): Promise<Response> => {
    const check = await requireRole(event.request, "admin");
    if (!check.isAllowed) {
      return check.response;
    }
    const db = getRecipeFlagDb();
    if (!db) {
      return new Response("Recipes unavailable", { status: 500 });
    }
    const isUpdated = await setRecipeFlag(db, event.params.slug, flag, isSet);
    if (!isUpdated) {
      return new Response("Recipe not found", { status: 404 });
    }
    return new Response(null, { status: 204 });
  };
