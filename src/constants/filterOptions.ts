import {
  type DifficultyTranslationKey,
  type DifficultyValue,
  difficultyDefinitions,
} from "./difficultyOptions.js";
import { type TagTranslationKey, type TagValue, tagDefinitions } from "./tagOptions.js";
import { type TimeTranslationKey, type TimeValue, timeDefinitions } from "./timeOptions.js";

export const createTagOptions = <T>(t: { tags: Record<TagTranslationKey, T> }) =>
  Object.entries(tagDefinitions).map(([value, key]) => ({
    value: value as TagValue,
    label: t.tags[key as TagTranslationKey],
  }));

export const createDifficultyOptions = <T>(t: { filters: Record<DifficultyTranslationKey, T> }) =>
  Object.entries(difficultyDefinitions).map(([value, key]) => ({
    value: value as DifficultyValue,
    label: t.filters[key as DifficultyTranslationKey],
  }));

export const createTimeOptions = <T>(t: { filters: Record<TimeTranslationKey, T> }) =>
  Object.entries(timeDefinitions).map(([value, key]) => ({
    value: value as TimeValue,
    label: t.filters[key as TimeTranslationKey],
  }));
