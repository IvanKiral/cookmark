import { handleClearRecipeVerdict, handleSetRecipeVerdict } from "~/lib/recipeVerdictStore.ts";

export const PUT = handleSetRecipeVerdict;
export const DELETE = handleClearRecipeVerdict;
