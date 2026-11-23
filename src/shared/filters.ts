import { recipeVerdictValues } from "./verdicts.ts";

// Value lists of the list filters, shared by the URL params and the stored smart filters.

export const difficultyValues = ["Easy", "Medium", "Hard"] as const;

export type DifficultyValue = (typeof difficultyValues)[number];
export type DifficultyFilter = ReadonlyArray<DifficultyValue>;

export const timeValues = ["under30", "under60", "over60"] as const;

export type TimeValue = (typeof timeValues)[number];
export type TimeFilter = ReadonlyArray<TimeValue>;

// Filter-only value for recipes the admins have not given a verdict yet. It is
// never stored on a recipe.
export const NO_VERDICT = "no-verdict";

// The Chef's verdict filter offers every admin verdict plus the recipes without one.
export const recommendedValues = [...recipeVerdictValues, NO_VERDICT] as const;

export type RecommendedValue = (typeof recommendedValues)[number];
export type RecommendedFilter = ReadonlyArray<RecommendedValue>;
