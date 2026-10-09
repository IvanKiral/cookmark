// Recipe-level highlights set by admins (as opposed to per-user marks).
export const recommendedValues = ["chef-pick"] as const;

export type RecommendedValue = (typeof recommendedValues)[number];
export type RecommendedFilter = ReadonlyArray<RecommendedValue>;
