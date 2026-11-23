import { useSearchParams } from "@solidjs/router";
import { type Accessor, createMemo } from "solid-js";
import { type SortValue, sortValues } from "~/app/recipe-list/sortOptions.ts";
import { difficultyValues, recommendedValues, timeValues } from "~/shared/filters.ts";
import { tagValues } from "~/shared/tags.ts";
import { type RecipeFilterKey, type RecipeFilters, recipeFilterKeys } from "./recipeFilters.ts";
import {
  parseArrayParam,
  parsePageParam,
  parseStringParam,
  serializeArrayParam,
} from "./searchParams.ts";

export type RecipeListParams = {
  // The raw ?in= value: favorites, to-try or a collection id (see places.ts).
  placeParam: Accessor<string | undefined>;
  filters: Accessor<RecipeFilters>;
  searchQuery: Accessor<string>;
  // undefined when the URL has none; the default depends on the place.
  sortParam: Accessor<SortValue | undefined>;
  page: Accessor<number>;
  setFilter: <K extends RecipeFilterKey>(key: K, values: RecipeFilters[K]) => void;
  clearFilters: () => void;
  // Clears the search as well as the filters.
  resetAll: () => void;
  setSearchQuery: (query: string) => void;
  setSortParam: (sort: SortValue | undefined) => void;
  setPage: (page: number) => void;
  // Keeps search and filters; undefined opens All.
  setPlace: (param: string | undefined) => void;
  // Opens a place with no filters or search, e.g. a collection just created.
  openPlaceFresh: (param: string | undefined) => void;
};

const clearedFilters = Object.fromEntries(recipeFilterKeys.map((key) => [key, undefined]));

// The home page keeps search, filters, sort and page in the URL, so a filtered
// list can be shared and Back from a recipe restores it. Authors come from the
// loaded recipes, so only known authors are kept.
export const useRecipeListParams = (
  authorValues: Accessor<ReadonlyArray<string>>,
): RecipeListParams => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = createMemo(
    (): RecipeFilters => ({
      difficulty: parseArrayParam(searchParams.difficulty, difficultyValues),
      time: parseArrayParam(searchParams.time, timeValues),
      tag: parseArrayParam(searchParams.tag, tagValues),
      author: parseArrayParam(searchParams.author, authorValues()),
      recommended: parseArrayParam(searchParams.recommended, recommendedValues),
    }),
  );

  const searchQuery = createMemo(() => parseStringParam(searchParams.q));

  const placeParam = createMemo(() => parseStringParam(searchParams.in) || undefined);

  const sortParam = createMemo((): SortValue | undefined => {
    const value = parseStringParam(searchParams.sort);
    return sortValues.find((sortValue) => sortValue === value);
  });

  const page = createMemo(() => parsePageParam(searchParams.page));

  // Any change other than paging starts again from the first page.
  const update = (params: Record<string, string | undefined>): void => {
    setSearchParams({ ...params, page: undefined });
  };

  return {
    placeParam,
    filters,
    searchQuery,
    sortParam,
    page,
    setFilter: (key, values) => update({ [key]: serializeArrayParam(values) }),
    clearFilters: () => update(clearedFilters),
    resetAll: () => update({ ...clearedFilters, q: undefined }),
    setSearchQuery: (query) => update({ q: query || undefined }),
    setSortParam: (nextSort) => update({ sort: nextSort }),
    setPlace: (param) => update({ in: param }),
    openPlaceFresh: (param) => update({ ...clearedFilters, q: undefined, in: param }),
    setPage: (nextPage) => setSearchParams({ page: nextPage === 1 ? undefined : String(nextPage) }),
  };
};
