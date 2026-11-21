import { useSearchParams } from "@solidjs/router";
import { type Accessor, createMemo } from "solid-js";
import { DEFAULT_SORT, type SortValue, sortValues } from "~/app/recipe-list/sortOptions.ts";
import { markValues } from "~/shared/marks.ts";
import { tagValues } from "~/shared/tags.ts";
import { difficultyValues } from "./difficultyOptions.ts";
import { type RecipeFilterKey, type RecipeFilters, recipeFilterKeys } from "./recipeFilters.ts";
import { recommendedValues } from "./recommendedOptions.ts";
import {
  parseArrayParam,
  parsePageParam,
  parseStringParam,
  serializeArrayParam,
} from "./searchParams.ts";
import { timeValues } from "./timeOptions.ts";

export type RecipeListParams = {
  filters: Accessor<RecipeFilters>;
  searchQuery: Accessor<string>;
  sort: Accessor<SortValue>;
  page: Accessor<number>;
  setFilter: <K extends RecipeFilterKey>(key: K, values: RecipeFilters[K]) => void;
  clearFilters: () => void;
  // Clears the search as well as the filters.
  resetAll: () => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: SortValue) => void;
  setPage: (page: number) => void;
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
      mark: parseArrayParam(searchParams.mark, markValues),
      recommended: parseArrayParam(searchParams.recommended, recommendedValues),
    }),
  );

  const searchQuery = createMemo(() => parseStringParam(searchParams.q));

  const sort = createMemo((): SortValue => {
    const value = parseStringParam(searchParams.sort);
    return sortValues.find((sortValue) => sortValue === value) ?? DEFAULT_SORT;
  });

  const page = createMemo(() => parsePageParam(searchParams.page));

  // Any change other than paging starts again from the first page.
  const update = (params: Record<string, string | undefined>): void => {
    setSearchParams({ ...params, page: undefined });
  };

  return {
    filters,
    searchQuery,
    sort,
    page,
    setFilter: (key, values) => update({ [key]: serializeArrayParam(values) }),
    clearFilters: () => update(clearedFilters),
    resetAll: () => update({ ...clearedFilters, q: undefined }),
    setSearchQuery: (query) => update({ q: query || undefined }),
    setSort: (nextSort) => update({ sort: nextSort === DEFAULT_SORT ? undefined : nextSort }),
    setPage: (nextPage) => setSearchParams({ page: nextPage === 1 ? undefined : String(nextPage) }),
  };
};
