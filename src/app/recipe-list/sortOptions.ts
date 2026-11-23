import { recipeListStrings } from "./strings.ts";

export const sortValues = [
  "date-desc",
  "date-asc",
  "name-asc",
  "name-desc",
  "time-asc",
  "time-desc",
  "difficulty-easy",
  "difficulty-hard",
] as const;

export type SortValue = (typeof sortValues)[number];

export const DEFAULT_SORT: SortValue = "date-desc";

// Only inside a manual collection, where it is the default: the collection's own order.
export const YOUR_ORDER = "your-order";

export type ListSort = SortValue | typeof YOUR_ORDER;

export type SortOption<T extends string = ListSort> = {
  value: T;
  label: string;
  shortLabel: string;
};

const strings = recipeListStrings.sort;

export const sortOptions: ReadonlyArray<SortOption<SortValue>> = [
  { value: "date-desc", label: strings.dateDesc, shortLabel: strings.shortDateDesc },
  { value: "date-asc", label: strings.dateAsc, shortLabel: strings.shortDateAsc },
  { value: "name-asc", label: strings.nameAsc, shortLabel: strings.shortNameAsc },
  { value: "name-desc", label: strings.nameDesc, shortLabel: strings.shortNameDesc },
  { value: "time-asc", label: strings.timeAsc, shortLabel: strings.shortTimeAsc },
  { value: "time-desc", label: strings.timeDesc, shortLabel: strings.shortTimeDesc },
  {
    value: "difficulty-easy",
    label: strings.difficultyEasy,
    shortLabel: strings.shortDifficultyEasy,
  },
  {
    value: "difficulty-hard",
    label: strings.difficultyHard,
    shortLabel: strings.shortDifficultyHard,
  },
];

export const yourOrderOption: SortOption = {
  value: YOUR_ORDER,
  label: strings.yourOrder,
  shortLabel: strings.yourOrder,
};
