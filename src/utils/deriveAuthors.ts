import type { Recipe } from "~/types/Recipe.ts";

export type AuthorOption = {
  value: string;
  label: string;
};

export const deriveAuthors = (recipes: ReadonlyArray<Recipe>): ReadonlyArray<string> => {
  const unique = new Set<string>();
  for (const recipe of recipes) {
    if (recipe.author) {
      unique.add(recipe.author);
    }
  }
  return [...unique].sort((a, b) => a.localeCompare(b));
};

export const buildAuthorOptions = (recipes: ReadonlyArray<Recipe>): ReadonlyArray<AuthorOption> =>
  deriveAuthors(recipes).map((author) => ({ value: author, label: `@${author}` }));
