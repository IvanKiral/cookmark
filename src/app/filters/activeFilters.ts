import { difficultyOptions, recommendedOptions, tagGroups, timeOptions } from "./filterOptions.ts";
import type { RecipeFilterKey, RecipeFilters } from "./recipeFilters.ts";

export type ActiveFilter = {
  key: RecipeFilterKey;
  value: string;
  label: string;
};

type Option = { value: string; label: string };

// The groups in the order the filter panel shows them.
const optionGroups: ReadonlyArray<{ key: RecipeFilterKey; options: ReadonlyArray<Option> }> = [
  { key: "recommended", options: recommendedOptions },
  ...tagGroups.map((group) => ({ key: "tag" as const, options: group.options })),
  { key: "time", options: timeOptions },
  { key: "difficulty", options: difficultyOptions },
];

// Every selected option with its label, in panel order; authors last, labelled by name.
export const listActiveFilters = (filters: RecipeFilters): ReadonlyArray<ActiveFilter> => [
  ...optionGroups.flatMap((group) =>
    group.options
      .filter((option) => (filters[group.key] as ReadonlyArray<string>).includes(option.value))
      .map((option) => ({ key: group.key, value: option.value, label: option.label })),
  ),
  ...filters.author.map((author) => ({ key: "author" as const, value: author, label: author })),
];

export const withoutFilterValue = (
  filters: RecipeFilters,
  key: RecipeFilterKey,
  value: string,
): RecipeFilters[RecipeFilterKey] =>
  (filters[key] as ReadonlyArray<string>).filter(
    (item) => item !== value,
  ) as RecipeFilters[RecipeFilterKey];
