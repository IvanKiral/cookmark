export const difficultyValues = ["Easy", "Medium", "Hard"] as const;

export type DifficultyValue = (typeof difficultyValues)[number];
export type DifficultyFilter = ReadonlyArray<DifficultyValue>;
