import { describe, expect, it } from "vitest";
import type { Recipe } from "./recipe.ts";
import { applyRecipeEdit, getInitialRecipeEdit, parseRecipeEdit } from "./recipeEdit.ts";

const validBody = {
  title: "  Soup  ",
  description: " Warm ",
  prep_time: 10,
  cook_time: 20,
  total_time: 30,
  tags: ["Soup", "Vegan", "Soup"],
  ingredients: [
    { name: " Water ", amount: "0,5", unit: " l " },
    { name: "Salt", amount: "a pinch", unit: "" },
    { name: "Pepper", amount: 2, unit: null },
  ],
  instructions: [{ name: "Main", steps: [" Boil ", "Serve"] }],
};

const recipe: Recipe = {
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
        ingredients: [
          { name: "Water", amount: 0.5, unit: "l" },
          { name: "Salt", amount: "a pinch", unit: null },
          { name: "Pepper", amount: 2, unit: null },
        ],
        instructions: [{ name: "Main", steps: ["Boil", "Serve"] }],
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
      ingredients: [
        { name: "Water", amount: "1", unit: "l" },
        { name: " ", amount: -1, unit: "x".repeat(31) },
      ],
      instructions: [
        { name: "Sauce", steps: ["Mix", ""] },
        { name: "", steps: ["Bake"] },
      ],
    });
    expect(result).toEqual({
      isValid: false,
      errors: {
        title: { code: "nameRequired" },
        description: { code: "tooLong", maxLength: 1000 },
        prep_time: { code: "minutes", max: 1440 },
        cook_time: { code: "minutes", max: 1440 },
        total_time: { code: "minutes", max: 1440 },
        tags: { code: "unknownTag", tag: "Pizza" },
        "ingredients.1.name": { code: "ingredientRequired" },
        "ingredients.1.amount": { code: "invalid" },
        "ingredients.1.unit": { code: "tooLong", maxLength: 30 },
        "instructions.0.steps.1": { code: "stepRequired" },
        "instructions.1.name": { code: "sectionNameRequired" },
      },
    });
  });

  it("rejects wrong types and a non-object body", () => {
    const result = parseRecipeEdit({
      ...validBody,
      title: 5,
      prep_time: "10",
      tags: "Soup",
      ingredients: {},
      instructions: [{ name: "Main", steps: "Boil" }],
    });
    expect(result.isValid).toBe(false);
    expect(result.isValid ? {} : Object.keys(result.errors)).toEqual([
      "title",
      "prep_time",
      "tags",
      "ingredients",
      "instructions.0.steps",
    ]);
    expect(parseRecipeEdit(null).isValid).toBe(false);
    expect(parseRecipeEdit([]).isValid).toBe(false);
  });

  it("rejects a name over the limit", () => {
    const result = parseRecipeEdit({ ...validBody, title: "x".repeat(121) });
    expect(result.isValid ? undefined : result.errors.title).toEqual({
      code: "tooLong",
      maxLength: 120,
    });
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
      ingredients: [
        { name: "Water", amount: 0.5, unit: "l" },
        { name: "Salt", amount: "a pinch", unit: null },
        { name: "Pepper", amount: 2, unit: null },
      ],
      instructions: [{ name: "Main", steps: ["Boil", "Serve"] }],
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

describe("getInitialRecipeEdit lists", () => {
  it("turns amounts into text for the inputs and fills missing units and lists", () => {
    const edit = getInitialRecipeEdit({
      ...recipe,
      ingredients: [
        { name: "Oregano", amount: 0.5, unit: null },
        { name: "Salt" } as unknown as Recipe["ingredients"][number],
      ],
      instructions: null as unknown as Recipe["instructions"],
    });
    expect(edit.ingredients).toEqual([
      { name: "Oregano", amount: "0.5", unit: "" },
      { name: "Salt", amount: "", unit: "" },
    ]);
    expect(edit.instructions).toEqual([]);
  });

  it("round-trips unchanged amounts to the stored values", () => {
    const initial = getInitialRecipeEdit({
      ...recipe,
      ingredients: [
        { name: "Oregano", amount: 0.5, unit: "tsp" },
        { name: "Flour", amount: "1/2", unit: "cup" },
        { name: "Salt", amount: null, unit: null },
      ],
    });
    const result = parseRecipeEdit(initial);
    expect(result.isValid ? result.edit.ingredients : []).toEqual([
      { name: "Oregano", amount: 0.5, unit: "tsp" },
      { name: "Flour", amount: "1/2", unit: "cup" },
      { name: "Salt", amount: null, unit: null },
    ]);
  });
});
