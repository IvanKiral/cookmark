import type { Collection } from "~/shared/collections.ts";
import { describeSmartFilters, type Place } from "./places.ts";
import { collectionStrings } from "./strings.ts";

// "All recipes", "Favourites", the collection's name, or "Add recipes to Soups" while picking.
export const placeTitleOf = (
  place: Place,
  collection: Collection | undefined,
  picking: Collection | undefined,
): string => {
  if (picking) {
    return collectionStrings.select.pickTitle(picking.name);
  }
  if (place.kind === "all") {
    return collectionStrings.places.allRecipes;
  }
  if (place.kind === "mark") {
    return place.mark === "favorite"
      ? collectionStrings.places.favorites
      : collectionStrings.places.toTry;
  }
  return collection?.name ?? "";
};

// "3 recipes", "3 recipes, your order" or "Smart filter: Soup, 3 recipes".
export const placeMetaOf = (collection: Collection | undefined, count: number): string => {
  if (collection?.kind === "manual") {
    return collectionStrings.header.manualMeta(count);
  }
  if (collection?.kind === "smart") {
    return collectionStrings.header.smartMeta(
      collection.filters ? describeSmartFilters(collection.filters) : "",
      count,
    );
  }
  return collectionStrings.recipeCount(count);
};

type SubtitleState = {
  collection: Collection | undefined;
  count: number;
  // Library recipes not yet in the collection being filled, in pick mode.
  pickableCount: number | undefined;
  isRenaming: boolean;
};

// The desktop subtitle under the place title.
export const placeSubtitleOf = (state: SubtitleState): string => {
  if (state.pickableCount !== undefined) {
    return collectionStrings.select.pickSubtitle(state.pickableCount);
  }
  return state.isRenaming
    ? collectionStrings.header.renameHint
    : placeMetaOf(state.collection, state.count);
};
