import {
  type DifficultyFilter,
  difficultyValues,
  type RecommendedFilter,
  recommendedValues,
  type TimeFilter,
  timeValues,
} from "./filters.ts";
import { type TagFilter, tagValues } from "./tags.ts";

export type CollectionKind = "manual" | "smart";

export const collectionKindValues: ReadonlyArray<CollectionKind> = ["manual", "smart"];

// The list filters without `mark`.
export type SmartFilters = {
  difficulty: DifficultyFilter;
  time: TimeFilter;
  tag: TagFilter;
  author: ReadonlyArray<string>;
  recommended: RecommendedFilter;
};

export type Collection = {
  id: string;
  name: string;
  kind: CollectionKind;
  filters: SmartFilters | null;
  pinPosition: 1 | 2 | 3 | null;
  slugs: ReadonlyArray<string>;
};

export type CollectionErrorCode =
  | "invalid-body"
  | "name-empty"
  | "name-too-long"
  | "name-taken"
  | "pins-full"
  | "filters-invalid"
  | "filters-on-manual"
  | "slugs-on-smart"
  | "not-manual"
  | "order-mismatch";

export const MAX_PINS = 3;
export const MAX_COLLECTION_NAME_LENGTH = 60;

export const smartFilterKeys: ReadonlyArray<keyof SmartFilters> = [
  "difficulty",
  "time",
  "tag",
  "author",
  "recommended",
];

// Trims first. Returns undefined when valid.
export const validateCollectionName = (name: string): CollectionErrorCode | undefined => {
  const trimmed = name.trim();
  if (trimmed === "") {
    return "name-empty";
  }
  if (trimmed.length > MAX_COLLECTION_NAME_LENGTH) {
    return "name-too-long";
  }
  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// undefined for a value that is not a list; a missing key is an empty list.
const parseValues = <T extends string>(
  value: unknown,
  isValid: (item: string) => item is T,
): ReadonlyArray<T> | undefined => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.filter((item): item is string => typeof item === "string").filter(isValid);
  return [...new Set(items)];
};

const isOneOf =
  <T extends string>(values: ReadonlyArray<T>) =>
  (item: string): item is T =>
    values.includes(item as T);

const isNonEmpty = (item: string): item is string => item.trim() !== "";

export const countSmartFilterValues = (filters: SmartFilters): number =>
  smartFilterKeys.reduce((count, key) => count + filters[key].length, 0);

// Drops unknown values (like parseArrayParam). Returns undefined when the shape is wrong
// or nothing is left. `author` values are kept as any non-empty strings.
export const parseSmartFilters = (value: unknown): SmartFilters | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }
  const difficulty = parseValues(value.difficulty, isOneOf(difficultyValues));
  const time = parseValues(value.time, isOneOf(timeValues));
  const tag = parseValues(value.tag, isOneOf(tagValues));
  const author = parseValues(value.author, isNonEmpty);
  const recommended = parseValues(value.recommended, isOneOf(recommendedValues));
  if (!(difficulty && time && tag && author && recommended)) {
    return undefined;
  }
  const filters: SmartFilters = { difficulty, time, tag, author, recommended };
  return countSmartFilterValues(filters) > 0 ? filters : undefined;
};
