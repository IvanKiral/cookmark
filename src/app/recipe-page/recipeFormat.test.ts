import { describe, expect, it } from "vitest";
import { formatIngredient, formatMinutes } from "./recipeFormat.ts";

describe("formatMinutes", () => {
  it("shows minutes under an hour", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(1)).toBe("1 min");
  });

  it("shows hours and minutes from an hour", () => {
    expect(formatMinutes(70)).toBe("1 h 10 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatMinutes(600)).toBe("10 h");
  });

  it("returns undefined for unknown or zero minutes", () => {
    expect(formatMinutes(null)).toBeUndefined();
    expect(formatMinutes(0)).toBeUndefined();
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
