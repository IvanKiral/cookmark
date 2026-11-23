import type { SmartFilters } from "~/shared/collections.ts";
import type { TimeValue } from "~/shared/filters.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { tagGroupDefinitions } from "~/shared/tags.ts";
import { matchesTagFilter } from "./matchesTagFilter.ts";
import { matchesRecommendedFilter } from "./recommendedOptions.ts";

// Every filter the list supports, the same fields a smart filter stores. An
// empty selection does not filter.
export type RecipeFilters = SmartFilters;

export type RecipeFilterKey = keyof RecipeFilters;

export const emptyFilters: RecipeFilters = {
  difficulty: [],
  time: [],
  tag: [],
  author: [],
  recommended: [],
};

export const recipeFilterKeys: ReadonlyArray<RecipeFilterKey> = [
  "difficulty",
  "time",
  "tag",
  "author",
  "recommended",
];

export const countActiveFilters = (filters: RecipeFilters): number =>
  recipeFilterKeys.reduce((count, key) => count + filters[key].length, 0);

const matchesTime = (totalTime: number, time: TimeValue): boolean => {
  switch (time) {
    case "under30":
      return totalTime < 30;
    case "under60":
      return totalTime < 60;
    case "over60":
      return totalTime >= 60;
  }
};

const matchesAny = <T>(selected: ReadonlyArray<T>, matches: (value: T) => boolean): boolean =>
  selected.length === 0 || selected.some(matches);

// Different filters combine as an intersection; the values within one filter
// as a union, except tags (see matchesTagFilter).
export const filterRecipes = (
  recipes: ReadonlyArray<RecipeSummary>,
  filters: RecipeFilters,
): ReadonlyArray<RecipeSummary> =>
  recipes.filter(
    (recipe) =>
      matchesAny(filters.difficulty, (difficulty) => recipe.difficulty === difficulty) &&
      matchesAny(filters.time, (time) => matchesTime(recipe.total_time, time)) &&
      matchesTagFilter(recipe.tags, filters.tag, tagGroupDefinitions) &&
      matchesAny(filters.author, (author) => recipe.author === author) &&
      matchesRecommendedFilter(recipe.verdict, filters.recommended),
  );
