export const timeValues = ["under30", "under60", "over60"] as const;

export type TimeValue = (typeof timeValues)[number];
export type TimeFilter = ReadonlyArray<TimeValue>;
