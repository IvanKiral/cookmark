import type { RecipeEdit, RecipeEditErrors } from "~/shared/recipeEdit.ts";
import type { RecipeFlag } from "~/shared/recipeFlags.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";
import { revalidateRecipes } from "./recipeQueries.ts";

// Admin changes to a recipe. Each call refetches the recipes when it succeeds
// and reports failure (including network errors) instead of throwing.

const recipeFlagEndpoints: Record<RecipeFlag, string> = {
  "should-delete": "/api/should-delete",
};

const sendAndRevalidate = async (url: string, init: RequestInit): Promise<boolean> => {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      return false;
    }
    await revalidateRecipes();
    return true;
  } catch {
    return false;
  }
};

// No verdict clears the current one.
export const saveRecipeVerdict = (
  slug: string,
  verdict: RecipeVerdict | undefined,
): Promise<boolean> =>
  sendAndRevalidate(
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
  sendAndRevalidate(`${recipeFlagEndpoints[flag]}/${slug}`, { method: isSet ? "PUT" : "DELETE" });

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
    if (!response.ok) {
      return { kind: "failed" };
    }
    await revalidateRecipes();
    return { kind: "saved" };
  } catch {
    return { kind: "failed" };
  }
};
