import type { Ingredient } from "~/shared/recipe.ts";
import { recipePageStrings } from "./strings.ts";

// Unknown or zero minutes show as "N/A".
export const formatMinutes = (minutes: number | null): string =>
  minutes ? recipePageStrings.minutes(minutes) : recipePageStrings.notAvailable;

export const formatServings = (servings: number | null): string =>
  servings ? recipePageStrings.servingsCount(servings) : recipePageStrings.notAvailable;

// Amount and unit come first when known, e.g. "2 tbsp olive oil".
export const formatIngredient = (ingredient: Ingredient): string => {
  if (!ingredient.amount) {
    return ingredient.name;
  }
  if (!ingredient.unit) {
    return `${ingredient.amount} ${ingredient.name}`;
  }
  return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
};
