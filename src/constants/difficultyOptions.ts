import type { HandleNullString } from "~/utils/types";

// Difficulty definitions with translation key mappings
export const difficultyDefinitions = {
  null: "all",
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
} as const;

export const difficultyValues = Object.keys(difficultyDefinitions).map((key) =>
  key === "null" ? null : key,
) as ReadonlyArray<string | null>;

export type DifficultyFilter = HandleNullString<keyof typeof difficultyDefinitions>;

export type DifficultyTranslationKey =
  (typeof difficultyDefinitions)[keyof typeof difficultyDefinitions];
