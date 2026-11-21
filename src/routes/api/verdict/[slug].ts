import {
  handleClearRecipeVerdict,
  handleSetRecipeVerdict,
} from "~/server/recipes/recipeVerdictStore.ts";

export const PUT = handleSetRecipeVerdict;
export const DELETE = handleClearRecipeVerdict;
