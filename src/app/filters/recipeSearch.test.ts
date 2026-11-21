import { describe, expect, it } from "vitest";
import type { RecipeSummary } from "~/shared/recipe.ts";
import { createRecipeSearch } from "./recipeSearch.ts";

const recipe = (name: string, ingredients: ReadonlyArray<string>): RecipeSummary => ({
  url_slug: name.toLowerCase(),
  name,
  description: "",
  difficulty: "Easy",
  total_time: 20,
  tags: [],
  ingredients,
  image_url: "",
  created_at: "2024-01-01T00:00:00.000Z",
});

const recipes = [recipe("Tomato soup", ["tomato"]), recipe("Pancakes", ["flour", "milk"])];

describe("createRecipeSearch", () => {
  it("keeps every recipe for a blank query", () => {
    expect(createRecipeSearch(recipes)("  ")).toEqual(recipes);
  });

  it("finds recipes by name and ingredient, tolerating typos", () => {
    const search = createRecipeSearch(recipes);
    expect(search("tomatto").map((item) => item.name)).toEqual(["Tomato soup"]);
    expect(search("milk").map((item) => item.name)).toEqual(["Pancakes"]);
  });
});
