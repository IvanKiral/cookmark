// Recipe-level flags that only admins can change. Each one is a column on the
// recipes table (see recipeFlagStore.ts) with its own /api/<flag>/<slug> route.
export const recipeFlagValues = ["should-delete"] as const;

export type RecipeFlag = (typeof recipeFlagValues)[number];

export const recipeFlagEndpoints: Record<RecipeFlag, string> = {
  "should-delete": "/api/should-delete",
};
