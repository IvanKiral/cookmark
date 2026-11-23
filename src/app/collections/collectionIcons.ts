import type { Collection } from "~/shared/collections.ts";

// Material Symbols names: smart filters get `tune` everywhere.
export const collectionIcon = (collection: Collection): string =>
  collection.kind === "smart" ? "tune" : "collections_bookmark";

export const sortByPin = (collections: ReadonlyArray<Collection>): ReadonlyArray<Collection> =>
  collections
    .filter((collection) => collection.pinPosition !== null)
    .sort((a, b) => (a.pinPosition ?? 0) - (b.pinPosition ?? 0));
