import type { NewCollectionInput } from "~/app/api/collectionsApi.ts";
import {
  type Collection,
  type CollectionErrorCode,
  validateCollectionName,
} from "~/shared/collections.ts";
import type { CollectionsContextValue } from "./CollectionsContext.tsx";
import { collectionStrings } from "./strings.ts";

// What the database's COLLATE NOCASE treats as equal: ASCII letters ignoring case.
const asciiLower = (name: string): string =>
  name.replace(/[A-Z]/g, (letter) => letter.toLowerCase());

const isTaken = (
  name: string,
  collections: ReadonlyArray<Collection>,
  exceptId?: string,
): boolean =>
  collections.some(
    (collection) =>
      collection.id !== exceptId && asciiLower(collection.name) === asciiLower(name.trim()),
  );

export const describeNameError = (code: CollectionErrorCode | undefined, name: string): string => {
  switch (code) {
    case "name-empty":
      return collectionStrings.errors["name-empty"];
    case "name-too-long":
      return collectionStrings.errors["name-too-long"];
    case "name-taken":
      return collectionStrings.errors["name-taken"](name.trim());
    case "pins-full":
      return collectionStrings.errors["pins-full"];
    default:
      return collectionStrings.errors.couldNotSave;
  }
};

// The inline error for a name, checked before saving; the server checks again.
export const getNameError = (
  name: string,
  collections: ReadonlyArray<Collection>,
  exceptId?: string,
): string | undefined => {
  const code = validateCollectionName(name);
  if (code) {
    return describeNameError(code, name);
  }
  return isTaken(name, collections, exceptId) ? describeNameError("name-taken", name) : undefined;
};

// Checks the name, then creates (not optimistic). Resolves with the new
// collection, or the message to show next to the name.
export const createNamedCollection = async (
  collectionsContext: CollectionsContextValue,
  input: NewCollectionInput,
): Promise<Collection | string> => {
  const error = getNameError(input.name, collectionsContext.collections());
  if (error) {
    return error;
  }
  const result = await collectionsContext.create({ ...input, name: input.name.trim() });
  return result.isOk ? result.collection : describeNameError(result.error, input.name);
};
