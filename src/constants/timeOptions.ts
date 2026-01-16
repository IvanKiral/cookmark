export const timeDefinitions = {
  under30: "under30",
  under60: "under60",
  over60: "over60",
} as const;

export const timeValues = Object.keys(timeDefinitions) as ReadonlyArray<TimeValue>;

export type TimeValue = keyof typeof timeDefinitions;
export type TimeFilter = ReadonlyArray<TimeValue>;
export type TimeTranslationKey = (typeof timeDefinitions)[keyof typeof timeDefinitions];
