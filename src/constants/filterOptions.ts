// Unified filter options with helper functions
import {
  type DifficultyFilter,
  type DifficultyTranslationKey,
  difficultyDefinitions,
} from "./difficultyOptions.js";
import { type TagFilter, type TagTranslationKey, tagDefinitions } from "./tagOptions.js";
import { type TimeFilter, type TimeTranslationKey, timeDefinitions } from "./timeOptions.js";

export const createTagOptions = <T>(t: { tags: Record<TagTranslationKey, T> }) => {
  return Object.entries(tagDefinitions).map(([value, key]) => ({
    value: value === "null" ? null : value,
    label: t.tags[key],
  })) as Array<{ value: TagFilter; label: T }>;
};

export const createDifficultyOptions = <T>(t: { filters: Record<DifficultyTranslationKey, T> }) => {
  return Object.entries(difficultyDefinitions).map(([value, key]) => ({
    value: value === "null" ? null : value,
    label: t.filters[key],
  })) as Array<{ value: DifficultyFilter; label: T }>;
};

export const createTimeOptions = <T>(t: { filters: Record<TimeTranslationKey, T> }) => {
  return Object.entries(timeDefinitions).map(([value, key]) => ({
    value: value === "null" ? null : value,
    label: t.filters[key],
  })) as Array<{ value: TimeFilter; label: T }>;
};
