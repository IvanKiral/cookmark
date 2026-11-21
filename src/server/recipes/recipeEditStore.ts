import type { APIEvent } from "~/server/apiEvent.ts";
import { requireRole } from "~/server/auth/requireRole.ts";
import { getEnv } from "~/server/env.ts";
import type { Recipe } from "~/shared/recipe.ts";
import { applyRecipeEdit, parseRecipeEdit, type RecipeEdit } from "~/shared/recipeEdit.ts";

const getRecipeEditDb = (): D1Database | undefined => getEnv().RECIPES;

// Saves the current JSON to recipe_revisions and writes the edited JSON in one
// D1 batch, which is a single transaction. The UPDATE leaves the flag columns
// (verdict, should_delete) alone. Returns false when no recipe has this slug.
export const updateRecipe = async (
  db: D1Database,
  slug: string,
  edit: RecipeEdit,
  editedBy: string,
  now: string,
): Promise<boolean> => {
  const row = await db
    .prepare("SELECT data FROM recipes WHERE slug = ?")
    .bind(slug)
    .first<{ data: string }>();
  if (!row) {
    return false;
  }
  const edited = applyRecipeEdit(JSON.parse(row.data) as Recipe, edit);
  await db.batch([
    db
      .prepare(
        "INSERT INTO recipe_revisions (slug, data, edited_by, edited_at) VALUES (?, ?, ?, ?)",
      )
      .bind(slug, row.data, editedBy, now),
    db.prepare("UPDATE recipes SET data = ? WHERE slug = ?").bind(JSON.stringify(edited), slug),
  ]);
  return true;
};

const readJson = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
};

export const handleUpdateRecipe = async (event: APIEvent): Promise<Response> => {
  const check = await requireRole(event.request, "admin");
  if (!check.isAllowed) {
    return check.response;
  }
  const db = getRecipeEditDb();
  if (!db) {
    return new Response("Recipes unavailable", { status: 500 });
  }
  const body = await readJson(event.request);
  if (body === undefined) {
    return new Response("Invalid JSON", { status: 400 });
  }
  const result = parseRecipeEdit(body);
  if (!result.isValid) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }
  const isUpdated = await updateRecipe(
    db,
    event.params.slug,
    result.edit,
    check.user.email,
    new Date().toISOString(),
  );
  if (!isUpdated) {
    return new Response("Recipe not found", { status: 404 });
  }
  return new Response(null, { status: 204 });
};
