export type SortOption = {
  value: string;
  label: string;
};

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
