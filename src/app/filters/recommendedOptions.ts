import { NO_VERDICT, type RecommendedFilter } from "~/shared/filters.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";

export const matchesRecommendedFilter = (
  verdict: RecipeVerdict | undefined,
  filter: RecommendedFilter,
): boolean => {
  if (filter.length === 0) {
    return true;
  }
  return filter.includes(verdict ?? NO_VERDICT);
};
