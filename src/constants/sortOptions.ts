export type SortOption = {
  value: string;
  label: string;
};

export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "time-asc", label: "Time (shortest first)" },
  { value: "time-desc", label: "Time (longest first)" },
  { value: "difficulty-easy", label: "Difficulty (easy first)" },
  { value: "difficulty-hard", label: "Difficulty (hard first)" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];