import type { RecipeSummary } from "~/shared/recipe.ts";
import type { SortValue } from "./sortOptions.ts";

type Comparator = (a: RecipeSummary, b: RecipeSummary) => number;

const byDifficulty =
  (order: Record<RecipeSummary["difficulty"], number>): Comparator =>
  (a, b) =>
    order[a.difficulty] - order[b.difficulty];

// Unknown difficulty always sorts last.
const comparators: Record<SortValue, Comparator> = {
  "date-desc": (a, b) => b.created_at.localeCompare(a.created_at),
  "date-asc": (a, b) => a.created_at.localeCompare(b.created_at),
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "time-asc": (a, b) => a.total_time - b.total_time,
  "time-desc": (a, b) => b.total_time - a.total_time,
  "difficulty-easy": byDifficulty({ Easy: 0, Medium: 1, Hard: 2, Unknown: 3 }),
  "difficulty-hard": byDifficulty({ Hard: 0, Medium: 1, Easy: 2, Unknown: 3 }),
};

export const sortRecipes = (
  recipes: ReadonlyArray<RecipeSummary>,
  sort: SortValue,
): ReadonlyArray<RecipeSummary> => [...recipes].sort(comparators[sort]);
