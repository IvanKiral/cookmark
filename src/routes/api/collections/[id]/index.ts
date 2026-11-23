import {
  handleDeleteCollection,
  handleUpdateCollection,
} from "~/server/collections/collectionHandlers.ts";

export const PUT = handleUpdateCollection;
export const DELETE = handleDeleteCollection;
