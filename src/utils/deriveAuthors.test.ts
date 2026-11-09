import { describe, expect, it } from "vitest";
import type { Recipe } from "~/types/Recipe.ts";
import { buildAuthorOptions, deriveAuthors } from "./deriveAuthors.ts";

const makeRecipe = (author?: string): Recipe => ({
  id: "1",
  url_slug: "slug",
  name: "Recipe",
  description: "",
  difficulty: "Easy",
  time: "10 min",
  total_time: 10,
  tags: [],
  ingredients: [],
  author,
  image_url: "/thumbnails/test",
  created_at: "2026-01-01T00:00:00.000Z",
});

describe("deriveAuthors", () => {
  it("returns unique authors sorted alphabetically", () => {
    const recipes = [makeRecipe("zuzka"), makeRecipe("marek"), makeRecipe("zuzka")];
    expect(deriveAuthors(recipes)).toEqual(["marek", "zuzka"]);
  });

  it("ignores recipes without an author", () => {
    const recipes = [makeRecipe("marek"), makeRecipe(undefined), makeRecipe("")];
    expect(deriveAuthors(recipes)).toEqual(["marek"]);
  });

  it("builds options with @-prefixed labels", () => {
    expect(buildAuthorOptions([makeRecipe("marek")])).toEqual([
      { value: "marek", label: "@marek" },
    ]);
  });
});
