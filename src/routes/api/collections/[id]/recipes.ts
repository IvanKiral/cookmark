import {
  handleAddCollectionRecipes,
  handleRemoveCollectionRecipes,
} from "~/server/collections/collectionHandlers.ts";

export const POST = handleAddCollectionRecipes;
export const DELETE = handleRemoveCollectionRecipes;
