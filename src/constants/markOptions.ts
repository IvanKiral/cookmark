// Per-user recipe marks. Values match the user_recipe_marks.mark column.
export const markValues = ["favorite", "to-try"] as const;

export type Mark = (typeof markValues)[number];
export type MarkFilter = ReadonlyArray<Mark>;

export const markEndpoints: Record<Mark, string> = {
  favorite: "/api/favorites",
  "to-try": "/api/to-try",
};
