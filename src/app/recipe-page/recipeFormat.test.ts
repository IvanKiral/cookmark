import { describe, expect, it } from "vitest";
import { formatIngredient, formatMinutes, formatServings } from "./recipeFormat.ts";

describe("formatMinutes", () => {
  it("shows minutes", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("shows N/A for unknown or zero minutes", () => {
    expect(formatMinutes(null)).toBe("N/A");
    expect(formatMinutes(0)).toBe("N/A");
  });
});

describe("formatServings", () => {
  it("shows servings or N/A", () => {
    expect(formatServings(4)).toBe("4 servings");
    expect(formatServings(null)).toBe("N/A");
  });
});

describe("formatIngredient", () => {
  it("puts the amount and unit before the name when known", () => {
    expect(formatIngredient({ name: "olive oil", amount: 2, unit: "tbsp" })).toBe(
      "2 tbsp olive oil",
    );
    expect(formatIngredient({ name: "eggs", amount: "2", unit: null })).toBe("2 eggs");
    expect(formatIngredient({ name: "salt", amount: null, unit: "pinch" })).toBe("salt");
  });
});
