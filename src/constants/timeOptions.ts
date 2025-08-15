// Time filter definitions with translation key mappings
export const timeDefinitions = {
  null: "all",
  under30: "under30",
  under60: "under60",
  over60: "over60",
} as const;

export const timeValues = Object.keys(timeDefinitions).map((key) =>
  key === "null" ? null : key,
) as ReadonlyArray<string | null>;

export type TimeFilter = (typeof timeValues)[number];
export type TimeTranslationKey = (typeof timeDefinitions)[keyof typeof timeDefinitions];
