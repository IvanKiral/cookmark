import {
  difficultyOptions,
  recommendedOptions,
  tagOptions,
  timeOptions,
} from "~/app/filters/filterOptions.ts";
import { filterRecipes } from "~/app/filters/recipeFilters.ts";
import type { Collection, SmartFilters } from "~/shared/collections.ts";
import type { Mark } from "~/shared/marks.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { type TagGroupKey, tagGroupDefinitions } from "~/shared/tags.ts";
import { collectionStrings } from "./strings.ts";

// Where the list is: everything, a mark, or one of the user's collections.
export type Place =
  | { kind: "all" }
  | { kind: "mark"; mark: Mark }
  | { kind: "collection"; id: string };

const FAVORITES_PARAM = "favorites";
const TO_TRY_PARAM = "to-try";

// "favorites" → favorite mark, "to-try" → to-try mark, a known collection id → collection, else all.
export const parsePlaceParam = (
  param: string | string[] | undefined,
  collections: ReadonlyArray<Collection>,
): Place => {
  if (typeof param !== "string") {
    return { kind: "all" };
  }
  if (param === FAVORITES_PARAM) {
    return { kind: "mark", mark: "favorite" };
  }
  if (param === TO_TRY_PARAM) {
    return { kind: "mark", mark: "to-try" };
  }
  return collections.some((collection) => collection.id === param)
    ? { kind: "collection", id: param }
    : { kind: "all" };
};

// undefined for all.
export const serializePlace = (place: Place): string | undefined => {
  switch (place.kind) {
    case "all":
      return undefined;
    case "mark":
      return place.mark === "favorite" ? FAVORITES_PARAM : TO_TRY_PARAM;
    case "collection":
      return place.id;
  }
};

export const isSamePlace = (a: Place, b: Place): boolean => serializePlace(a) === serializePlace(b);

export const findPlaceCollection = (
  place: Place,
  collections: ReadonlyArray<Collection>,
): Collection | undefined =>
  place.kind === "collection"
    ? collections.find((collection) => collection.id === place.id)
    : undefined;

// The recipes of a manual collection in its order, skipping recipes that left the library.
const recipesOfManual = (
  recipes: ReadonlyArray<RecipeSummary>,
  collection: Collection,
): ReadonlyArray<RecipeSummary> => {
  const bySlug = new Map(recipes.map((recipe) => [recipe.url_slug, recipe]));
  return collection.slugs.flatMap((slug) => {
    const recipe = bySlug.get(slug);
    return recipe ? [recipe] : [];
  });
};

// Manual: collection order, recipes missing from the library dropped. Smart: library order, filtered
// with filterRecipes; a smart collection with `filters: null` returns []. Mark: recipes with the mark.
// All: every recipe.
export const recipesInPlace = (
  recipes: ReadonlyArray<RecipeSummary>,
  place: Place,
  isMarked: (mark: Mark, slug: string) => boolean,
  collections: ReadonlyArray<Collection>,
): ReadonlyArray<RecipeSummary> => {
  if (place.kind === "all") {
    return recipes;
  }
  if (place.kind === "mark") {
    return recipes.filter((recipe) => isMarked(place.mark, recipe.url_slug));
  }
  const collection = findPlaceCollection(place, collections);
  if (!collection) {
    return recipes;
  }
  if (collection.kind === "manual") {
    return recipesOfManual(recipes, collection);
  }
  return collection.filters ? filterRecipes(recipes, collection.filters) : [];
};

const labelOf = (options: ReadonlyArray<{ value: string; label: string }>, value: string): string =>
  options.find((option) => option.value === value)?.label ?? value;

// Description order: what a recipe is (protein, meal, type, method, diet), then how it is made.
const tagGroupOrder: ReadonlyArray<TagGroupKey> = ["protein", "meal", "type", "method", "diet"];

const describeTagGroup = (filters: SmartFilters, key: TagGroupKey): string | undefined => {
  const group = tagGroupDefinitions.find((definition) => definition.key === key);
  const selected = group?.values.filter((value) => filters.tag.includes(value)) ?? [];
  if (!group || selected.length === 0) {
    return undefined;
  }
  const separator = group.match === "all" ? collectionStrings.and : collectionStrings.or;
  return selected.map((value) => labelOf(tagOptions, value)).join(separator);
};

const describeValues = (
  values: ReadonlyArray<string>,
  options: ReadonlyArray<{ value: string; label: string }>,
): string | undefined =>
  values.length > 0
    ? values.map((value) => labelOf(options, value)).join(collectionStrings.or)
    : undefined;

// "Chicken or Pork, Dinner"; Diet values joined with " and "; labels from the filter options.
export const describeSmartFilters = (filters: SmartFilters): string =>
  [
    ...tagGroupOrder.map((key) => describeTagGroup(filters, key)),
    describeValues(filters.time, timeOptions),
    describeValues(filters.difficulty, difficultyOptions),
    describeValues(filters.recommended, recommendedOptions),
    describeValues(filters.author, []),
  ]
    .filter((part): part is string => part !== undefined)
    .join(", ");
