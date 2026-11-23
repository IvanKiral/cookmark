import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vitest";
import { countActiveFilters } from "./recipeFilters.ts";
import { type RecipeListParams, useRecipeListParams } from "./useRecipeListParams.ts";

const { searchParams } = vi.hoisted(() => ({
  searchParams: { mark: "favorite", tag: "Soup", in: "favorites" } as Record<string, string>,
}));

vi.mock("@solidjs/router", () => ({
  useSearchParams: () => [searchParams, vi.fn()],
}));

describe("useRecipeListParams", () => {
  afterEach(() => {
    cleanup();
  });

  it("ignores the old mark param and reads the place from ?in=", () => {
    const holder: { params?: RecipeListParams } = {};
    const Harness = () => {
      holder.params = useRecipeListParams(() => []);
      return null;
    };
    render(() => <Harness />);
    const filters = holder.params?.filters();
    expect(filters).toEqual({
      difficulty: [],
      time: [],
      tag: ["Soup"],
      author: [],
      recommended: [],
    });
    expect(filters && countActiveFilters(filters)).toBe(1);
    expect(holder.params?.placeParam()).toBe("favorites");
  });
});
