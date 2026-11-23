import {
  DEFAULT_SORT,
  type ListSort,
  type SortOption,
  type SortValue,
  sortOptions,
  YOUR_ORDER,
  yourOrderOption,
} from "./sortOptions.ts";

// Inside a manual collection no sort param means "Your order"; elsewhere the usual default.
export const defaultListSort = (isManualCollection: boolean): ListSort =>
  isManualCollection ? YOUR_ORDER : DEFAULT_SORT;

export const resolveListSort = (
  sortParam: SortValue | undefined,
  isManualCollection: boolean,
): ListSort => sortParam ?? defaultListSort(isManualCollection);

export const listSortOptions = (isManualCollection: boolean): ReadonlyArray<SortOption> =>
  isManualCollection ? [yourOrderOption, ...sortOptions] : sortOptions;

// The sort param to write: none for the place's default. Inside a manual
// collection every other choice is written, even the usual default "Newest".
export const sortParamFor = (
  next: ListSort,
  isManualCollection: boolean,
): SortValue | undefined => {
  if (next === YOUR_ORDER) {
    return undefined;
  }
  return !isManualCollection && next === DEFAULT_SORT ? undefined : next;
};
