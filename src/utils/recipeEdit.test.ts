import { describe, expect, it } from "vitest";
import type { RecipeData } from "~/types/Recipe.ts";
import { applyRecipeEdit, getInitialRecipeEdit, parseRecipeEdit } from "./recipeEdit.ts";

const validBody = {
  title: "  Soup  ",
  description: " Warm ",
  prep_time: 10,
  cook_time: 20,
  total_time: 30,
  tags: ["Soup", "Vegan", "Soup"],
};

const recipe: RecipeData = {
  title: "Old soup",
  description: "Old",
  prep_time: 5,
  cook_time: null,
  total_time: null,
  servings: 2,
  ingredients: [{ name: "Water", amount: "1", unit: "l" }],
  instructions: [{ name: "Main", steps: ["Boil"] }],
  tags: ["Soup"],
  difficulty: "easy",
  cuisine: null,
  source_url: "https://example.com/soup",
  author: "ana",
  video_url: "/media/soup",
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("parseRecipeEdit", () => {
  it("trims text and removes duplicate tags", () => {
    expect(parseRecipeEdit(validBody)).toEqual({
      isValid: true,
      edit: {
        title: "Soup",
        description: "Warm",
        prep_time: 10,
        cook_time: 20,
        total_time: 30,
        tags: ["Soup", "Vegan"],
      },
    });
  });

  it("accepts unknown times as null and an empty description", () => {
    const result = parseRecipeEdit({
      ...validBody,
      description: "",
      prep_time: null,
      cook_time: null,
      total_time: null,
      tags: [],
    });
    expect(result.isValid).toBe(true);
  });

  it("reports every invalid field", () => {
    const result = parseRecipeEdit({
      title: "   ",
      description: "x".repeat(1001),
      prep_time: -1,
      cook_time: 2.5,
      total_time: 1441,
      tags: ["Soup", "Pizza"],
    });
    expect(result).toEqual({
      isValid: false,
      errors: {
        title: "Enter a name.",
        description: "Keep the description to 1000 characters or fewer.",
        prep_time: "Enter whole minutes from 0 to 1440.",
        cook_time: "Enter whole minutes from 0 to 1440.",
        total_time: "Enter whole minutes from 0 to 1440.",
        tags: "Unknown tag: Pizza.",
      },
    });
  });

  it("rejects wrong types and a non-object body", () => {
    const result = parseRecipeEdit({ ...validBody, title: 5, prep_time: "10", tags: "Soup" });
    expect(result.isValid).toBe(false);
    expect(result.isValid ? {} : Object.keys(result.errors)).toEqual([
      "title",
      "prep_time",
      "tags",
    ]);
    expect(parseRecipeEdit(null).isValid).toBe(false);
    expect(parseRecipeEdit([]).isValid).toBe(false);
  });

  it("rejects a name over the limit", () => {
    const result = parseRecipeEdit({ ...validBody, title: "x".repeat(121) });
    expect(result.isValid ? undefined : result.errors.title).toBe(
      "Keep the name to 120 characters or fewer.",
    );
  });
});

describe("applyRecipeEdit", () => {
  it("changes only the editable fields", () => {
    const result = parseRecipeEdit(validBody);
    if (!result.isValid) {
      throw new Error("expected a valid edit");
    }
    expect(applyRecipeEdit(recipe, result.edit)).toEqual({
      ...recipe,
      title: "Soup",
      description: "Warm",
      prep_time: 10,
      cook_time: 20,
      total_time: 30,
      tags: ["Soup", "Vegan"],
    });
  });
});

describe("getInitialRecipeEdit", () => {
  it("pre-fills a missing total with prep + cook", () => {
    expect(getInitialRecipeEdit(recipe).total_time).toBe(5);
  });

  it("keeps a stored total and leaves an unknown total empty", () => {
    expect(getInitialRecipeEdit({ ...recipe, total_time: 45 }).total_time).toBe(45);
    expect(getInitialRecipeEdit({ ...recipe, prep_time: null }).total_time).toBeNull();
  });
});
