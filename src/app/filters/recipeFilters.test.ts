import { describe, expect, it } from "vitest";
import type { Mark } from "~/shared/marks.ts";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { countActiveFilters, emptyFilters, filterRecipes } from "./recipeFilters.ts";

const recipe = (overrides: Partial<RecipeSummary>): RecipeSummary => ({
  url_slug: "recipe",
  name: "Recipe",
  description: "",
  difficulty: "Easy",
  total_time: 20,
  tags: [],
  ingredients: [],
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const soup = recipe({ url_slug: "soup", total_time: 20, tags: ["Soup", "Vegan"], author: "ana" });
const stew = recipe({
  url_slug: "stew",
  difficulty: "Medium",
  total_time: 90,
  tags: ["Beef"],
  verdict: "chef-kiss",
});
const cake = recipe({ url_slug: "cake", difficulty: "Hard", total_time: 45, tags: ["Cake"] });
const recipes = [soup, stew, cake];

const isNeverMarked = (_mark: Mark, _slug: string): boolean => false;
const slugs = (list: ReadonlyArray<RecipeSummary>): ReadonlyArray<string> =>
  list.map((item) => item.url_slug);

describe("filterRecipes", () => {
  it("keeps every recipe without filters", () => {
    expect(slugs(filterRecipes(recipes, emptyFilters, isNeverMarked))).toEqual([
      "soup",
      "stew",
      "cake",
    ]);
  });

  it("combines values of one filter as a union", () => {
    const filters = { ...emptyFilters, difficulty: ["Easy", "Hard"] as const };
    expect(slugs(filterRecipes(recipes, filters, isNeverMarked))).toEqual(["soup", "cake"]);
  });

  it("combines different filters as an intersection", () => {
    const filters = { ...emptyFilters, time: ["under60"] as const, difficulty: ["Hard"] as const };
    expect(slugs(filterRecipes(recipes, filters, isNeverMarked))).toEqual(["cake"]);
  });

  it("matches time ranges on the total time", () => {
    const byTime = (time: "under30" | "under60" | "over60") =>
      slugs(filterRecipes(recipes, { ...emptyFilters, time: [time] }, isNeverMarked));
    expect(byTime("under30")).toEqual(["soup"]);
    expect(byTime("under60")).toEqual(["soup", "cake"]);
    expect(byTime("over60")).toEqual(["stew"]);
  });

  it("filters by tag, author, mark and verdict", () => {
    const filter = (overrides: object, isMarked = isNeverMarked) =>
      slugs(filterRecipes(recipes, { ...emptyFilters, ...overrides }, isMarked));
    expect(filter({ tag: ["Beef"] })).toEqual(["stew"]);
    expect(filter({ author: ["ana"] })).toEqual(["soup"]);
    expect(filter({ mark: ["favorite"] }, (_, slug) => slug === "cake")).toEqual(["cake"]);
    expect(filter({ recommended: ["chef-kiss"] })).toEqual(["stew"]);
  });
});

describe("countActiveFilters", () => {
  it("counts every selected value", () => {
    expect(countActiveFilters(emptyFilters)).toBe(0);
    expect(countActiveFilters({ ...emptyFilters, tag: ["Soup", "Beef"], mark: ["to-try"] })).toBe(
      3,
    );
  });
});
