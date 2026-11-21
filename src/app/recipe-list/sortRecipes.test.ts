import { describe, expect, it } from "vitest";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { sortRecipes } from "./sortRecipes.ts";

const recipe = (
  url_slug: string,
  difficulty: RecipeSummary["difficulty"],
  total_time: number,
  created_at: string,
): RecipeSummary => ({
  url_slug,
  name: url_slug,
  description: "",
  difficulty,
  total_time,
  tags: [],
  ingredients: [],
  image_url: "",
  created_at,
});

const recipes = [
  recipe("bread", "Hard", 120, "2024-03-01"),
  recipe("apple", "Unknown", 10, "2024-01-01"),
  recipe("curry", "Easy", 40, "2024-02-01"),
];

const sortedSlugs = (sort: Parameters<typeof sortRecipes>[1]): ReadonlyArray<string> =>
  sortRecipes(recipes, sort).map((item) => item.url_slug);

describe("sortRecipes", () => {
  it("sorts by date, name and time", () => {
    expect(sortedSlugs("date-desc")).toEqual(["bread", "curry", "apple"]);
    expect(sortedSlugs("date-asc")).toEqual(["apple", "curry", "bread"]);
    expect(sortedSlugs("name-asc")).toEqual(["apple", "bread", "curry"]);
    expect(sortedSlugs("name-desc")).toEqual(["curry", "bread", "apple"]);
    expect(sortedSlugs("time-asc")).toEqual(["apple", "curry", "bread"]);
    expect(sortedSlugs("time-desc")).toEqual(["bread", "curry", "apple"]);
  });

  it("sorts by difficulty with unknown last either way", () => {
    expect(sortedSlugs("difficulty-easy")).toEqual(["curry", "bread", "apple"]);
    expect(sortedSlugs("difficulty-hard")).toEqual(["bread", "curry", "apple"]);
  });

  it("leaves the input untouched", () => {
    sortRecipes(recipes, "name-asc");
    expect(recipes.map((item) => item.url_slug)).toEqual(["bread", "apple", "curry"]);
  });
});
