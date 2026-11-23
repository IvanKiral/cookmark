import type { Ingredient } from "~/shared/recipe.ts";
import { recipePageStrings } from "./strings.ts";

// 45 → "45 min", 70 → "1 h 10 min", 120 → "2 h", null or 0 → undefined (callers hide the item).
export const formatMinutes = (minutes: number | null): string | undefined => {
  if (!minutes) {
    return undefined;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return recipePageStrings.minutes(rest);
  }
  return rest === 0 ? recipePageStrings.hours(hours) : recipePageStrings.hoursMinutes(hours, rest);
};

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
