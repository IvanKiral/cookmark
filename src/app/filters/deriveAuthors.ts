import type { RecipeSummary } from "~/shared/recipe.ts";

export type AuthorOption = {
  value: string;
  label: string;
};

export const deriveAuthors = (recipes: ReadonlyArray<RecipeSummary>): ReadonlyArray<string> => {
  const unique = new Set<string>();
  for (const recipe of recipes) {
    if (recipe.author) {
      unique.add(recipe.author);
    }
  }
  return [...unique].sort((a, b) => a.localeCompare(b));
};

export const buildAuthorOptions = (
  recipes: ReadonlyArray<RecipeSummary>,
): ReadonlyArray<AuthorOption> =>
  deriveAuthors(recipes).map((author) => ({ value: author, label: `@${author}` }));
