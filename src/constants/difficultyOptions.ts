export const difficultyDefinitions = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
} as const;

export const difficultyValues = Object.keys(
  difficultyDefinitions,
) as ReadonlyArray<DifficultyValue>;

export type DifficultyValue = keyof typeof difficultyDefinitions;
export type DifficultyFilter = ReadonlyArray<DifficultyValue>;

export type DifficultyTranslationKey =
  (typeof difficultyDefinitions)[keyof typeof difficultyDefinitions];
