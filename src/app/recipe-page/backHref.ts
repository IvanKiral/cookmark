// What the list puts in the router state when it opens a recipe.
type RecipeNavState = {
  fromSearch?: string;
};

// Back to the list with the place, search and filters it had.
export const backHrefFrom = (state: unknown): string => {
  const fromSearch = (state as RecipeNavState | null | undefined)?.fromSearch;
  return fromSearch ? `/${fromSearch}` : "/";
};
