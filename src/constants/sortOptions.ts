export type SortOption = {
  value: string;
  label: string;
};

export const sortValues = [
  "name-asc",
  "name-desc",
  "time-asc",
  "time-desc",
  "difficulty-easy",
  "difficulty-hard",
] as const;

export type SortValue = (typeof sortValues)[number];
