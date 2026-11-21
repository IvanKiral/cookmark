import { type RecipeVerdict, recipeVerdictValues } from "~/shared/verdicts.ts";

// Filter-only value for recipes the admins have not given a verdict yet. It is
// never stored on a recipe.
export const NO_VERDICT = "no-verdict";

// The Recommended filter offers every admin verdict (as opposed to per-user marks)
// plus the recipes without one.
export const recommendedValues = [...recipeVerdictValues, NO_VERDICT] as const;

export type RecommendedValue = (typeof recommendedValues)[number];
export type RecommendedFilter = ReadonlyArray<RecommendedValue>;

export const matchesRecommendedFilter = (
  verdict: RecipeVerdict | undefined,
  filter: RecommendedFilter,
): boolean => {
  if (filter.length === 0) {
    return true;
  }
  return filter.includes(verdict ?? NO_VERDICT);
};
