import type { Mark, MarkFilter } from "~/shared/marks.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { type TagFilter, tagGroupDefinitions } from "~/shared/tags.ts";
import type { DifficultyFilter } from "./difficultyOptions.ts";
import { matchesTagFilter } from "./matchesTagFilter.ts";
import { matchesRecommendedFilter, type RecommendedFilter } from "./recommendedOptions.ts";
import type { TimeFilter, TimeValue } from "./timeOptions.ts";

// Every filter the list supports. An empty selection does not filter.
export type RecipeFilters = {
  difficulty: DifficultyFilter;
  time: TimeFilter;
  tag: TagFilter;
  author: ReadonlyArray<string>;
  mark: MarkFilter;
  recommended: RecommendedFilter;
};

export type RecipeFilterKey = keyof RecipeFilters;

export const emptyFilters: RecipeFilters = {
  difficulty: [],
  time: [],
  tag: [],
  author: [],
  mark: [],
  recommended: [],
};

export const recipeFilterKeys: ReadonlyArray<RecipeFilterKey> = [
  "difficulty",
  "time",
  "tag",
  "author",
  "mark",
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
  isMarked: (mark: Mark, slug: string) => boolean,
): ReadonlyArray<RecipeSummary> =>
  recipes.filter(
    (recipe) =>
      matchesAny(filters.difficulty, (difficulty) => recipe.difficulty === difficulty) &&
      matchesAny(filters.time, (time) => matchesTime(recipe.total_time, time)) &&
      matchesTagFilter(recipe.tags, filters.tag, tagGroupDefinitions) &&
      matchesAny(filters.author, (author) => recipe.author === author) &&
      matchesAny(filters.mark, (mark) => isMarked(mark, recipe.url_slug)) &&
      matchesRecommendedFilter(recipe.verdict, filters.recommended),
  );
