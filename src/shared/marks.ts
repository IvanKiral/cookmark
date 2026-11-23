// Per-user recipe marks. Values match the user_recipe_marks.mark column.
export const markValues = ["favorite", "to-try"] as const;

export type Mark = (typeof markValues)[number];
