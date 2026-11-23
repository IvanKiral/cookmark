import {
  handleCreateCollection,
  handleReadCollections,
} from "~/server/collections/collectionHandlers.ts";

export const GET = handleReadCollections;
export const POST = handleCreateCollection;
