import { type RecipeVerdict, recipeVerdictValues } from "./recipeVerdicts.ts";

// The Recommended filter offers every admin verdict (as opposed to per-user marks).
export const recommendedValues = recipeVerdictValues;

export type RecommendedValue = RecipeVerdict;
export type RecommendedFilter = ReadonlyArray<RecommendedValue>;
