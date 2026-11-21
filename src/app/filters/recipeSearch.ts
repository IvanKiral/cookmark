import Fuse from "fuse.js";
import type { RecipeSummary } from "~/shared/recipe.ts";

// Fuzzy search over the list, weighted towards the name. A blank query keeps
// every recipe.
export const createRecipeSearch = (
  recipes: ReadonlyArray<RecipeSummary>,
): ((query: string) => ReadonlyArray<RecipeSummary>) => {
  const fuse = new Fuse(recipes, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "ingredients", weight: 0.25 },
      { name: "tags", weight: 0.15 },
      { name: "author", weight: 0.15 },
      { name: "description", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });

  return (query) => {
    const trimmed = query.trim();
    return trimmed ? fuse.search(trimmed).map((result) => result.item) : recipes;
  };
};
