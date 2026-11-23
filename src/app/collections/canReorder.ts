import { type ListSort, YOUR_ORDER } from "~/app/recipe-list/sortOptions.ts";

export type ReorderConditions = {
  isManualCollection: boolean;
  isSelecting: boolean;
  activeFilterCount: number;
  searchQuery: string;
  sort: ListSort;
  recipeCount: number;
};

// Reorder needs the whole collection in its own order: a manual collection
// with more than one recipe, no filters or search, sorted by Your order.
export const canReorderPlace = (conditions: ReorderConditions): boolean =>
  conditions.isManualCollection &&
  !conditions.isSelecting &&
  conditions.activeFilterCount === 0 &&
  conditions.searchQuery === "" &&
  conditions.sort === YOUR_ORDER &&
  conditions.recipeCount > 1;
