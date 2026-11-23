import { describe, expect, it } from "vitest";
import type { Collection, SmartFilters } from "~/shared/collections.ts";
import type { Mark } from "~/shared/marks.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { describeSmartFilters, parsePlaceParam, recipesInPlace, serializePlace } from "./places.ts";

const noFilters: SmartFilters = { difficulty: [], time: [], tag: [], author: [], recommended: [] };

const manual: Collection = {
  id: "c1",
  name: "Soups",
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs: ["stew", "gone", "soup"],
};

const smart: Collection = {
  id: "c2",
  name: "Beef",
  kind: "smart",
  filters: { ...noFilters, tag: ["Beef"] },
  pinPosition: 1,
  slugs: [],
};

const emptySmart: Collection = { ...smart, id: "c3", filters: null };

const collections = [manual, smart, emptySmart];

const recipe = (slug: string, tags: ReadonlyArray<string> = []): RecipeSummary => ({
  url_slug: slug,
  name: slug,
  description: "",
  difficulty: "Easy",
  total_time: 20,
  tags,
  ingredients: [],
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
});

const recipes = [recipe("soup", ["Soup"]), recipe("stew", ["Beef"]), recipe("cake")];

const isMarked = (mark: Mark, slug: string): boolean => mark === "favorite" && slug === "cake";

const slugsIn = (param: string | undefined): ReadonlyArray<string> =>
  recipesInPlace(recipes, parsePlaceParam(param, collections), isMarked, collections).map(
    (item) => item.url_slug,
  );

describe("parsePlaceParam", () => {
  it("reads marks and known collections", () => {
    expect(parsePlaceParam("favorites", collections)).toEqual({ kind: "mark", mark: "favorite" });
    expect(parsePlaceParam("to-try", collections)).toEqual({ kind: "mark", mark: "to-try" });
    expect(parsePlaceParam("c2", collections)).toEqual({ kind: "collection", id: "c2" });
  });

  it("falls back to all for a missing, unknown or repeated param", () => {
    expect(parsePlaceParam(undefined, collections)).toEqual({ kind: "all" });
    expect(parsePlaceParam("deleted", collections)).toEqual({ kind: "all" });
    expect(parsePlaceParam(["c1", "c2"], collections)).toEqual({ kind: "all" });
    expect(parsePlaceParam("c1", [])).toEqual({ kind: "all" });
  });
});

describe("serializePlace", () => {
  it("writes the param back, with nothing for all", () => {
    expect(serializePlace({ kind: "all" })).toBeUndefined();
    expect(serializePlace({ kind: "mark", mark: "favorite" })).toBe("favorites");
    expect(serializePlace({ kind: "mark", mark: "to-try" })).toBe("to-try");
    expect(serializePlace({ kind: "collection", id: "c1" })).toBe("c1");
  });
});

describe("recipesInPlace", () => {
  it("returns every recipe for all", () => {
    expect(slugsIn(undefined)).toEqual(["soup", "stew", "cake"]);
  });

  it("returns the marked recipes for a mark", () => {
    expect(slugsIn("favorites")).toEqual(["cake"]);
    expect(slugsIn("to-try")).toEqual([]);
  });

  it("keeps a manual collection's order and drops recipes no longer in the library", () => {
    expect(slugsIn("c1")).toEqual(["stew", "soup"]);
  });

  it("filters the library for a smart filter, and matches nothing without filters", () => {
    expect(slugsIn("c2")).toEqual(["stew"]);
    expect(slugsIn("c3")).toEqual([]);
  });
});

describe("describeSmartFilters", () => {
  it("joins values of a group with or, and groups with commas", () => {
    expect(describeSmartFilters({ ...noFilters, tag: ["Dinner", "Pork", "Chicken"] })).toBe(
      "Chicken or Pork, Dinner",
    );
  });

  it("joins diet values with and", () => {
    expect(describeSmartFilters({ ...noFilters, tag: ["Lactose-free", "Vegan"] })).toBe(
      "Vegan and Lactose-free",
    );
  });

  it("uses the filter labels for time, difficulty, verdict and authors", () => {
    expect(
      describeSmartFilters({
        difficulty: ["Easy"],
        time: ["under30"],
        tag: ["Soup"],
        author: ["ana"],
        recommended: ["chef-kiss", "no-verdict"],
      }),
    ).toBe("Soup, Under 30 min, Easy, Chef's kiss or No verdict, ana");
  });
});
