import type { RecipeEdit, RecipeEditErrors } from "~/shared/recipeEdit.ts";
import type { RecipeFlag } from "~/shared/recipeFlags.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";

// Admin changes to a recipe. Each call reports failure (including network
// errors) instead of throwing; the caller's action refetches the recipes once
// a change is saved (revalidateRecipes).

const recipeFlagEndpoints: Record<RecipeFlag, string> = {
  "should-delete": "/api/should-delete",
};

const send = async (url: string, init: RequestInit): Promise<boolean> => {
  try {
    const response = await fetch(url, init);
    return response.ok;
  } catch {
    return false;
  }
};

// No verdict clears the current one.
export const saveRecipeVerdict = (
  slug: string,
  verdict: RecipeVerdict | undefined,
): Promise<boolean> =>
  send(
    `/api/verdict/${slug}`,
    verdict
      ? {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verdict }),
        }
      : { method: "DELETE" },
  );

export const saveRecipeFlag = (slug: string, flag: RecipeFlag, isSet: boolean): Promise<boolean> =>
  send(`${recipeFlagEndpoints[flag]}/${slug}`, { method: isSet ? "PUT" : "DELETE" });

export type SaveRecipeEditResult =
  | { kind: "saved" }
  | { kind: "invalid"; errors: RecipeEditErrors }
  | { kind: "failed" };

export const saveRecipeEdit = async (
  slug: string,
  edit: RecipeEdit,
): Promise<SaveRecipeEditResult> => {
  try {
    const response = await fetch(`/api/recipes/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    if (response.status === 422) {
      const body = (await response.json()) as { errors: RecipeEditErrors };
      return { kind: "invalid", errors: body.errors };
    }
    return response.ok ? { kind: "saved" } : { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
};
