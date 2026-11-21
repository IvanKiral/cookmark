import { recipePageStrings } from "./strings.ts";

// Unknown or zero minutes show as "N/A".
export const formatMinutes = (minutes: number | null): string =>
  minutes ? recipePageStrings.minutes(minutes) : recipePageStrings.notAvailable;
