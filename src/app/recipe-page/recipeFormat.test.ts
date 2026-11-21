import { describe, expect, it } from "vitest";
import { formatMinutes } from "./recipeFormat.ts";

describe("formatMinutes", () => {
  it("shows minutes", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("shows N/A for unknown or zero minutes", () => {
    expect(formatMinutes(null)).toBe("N/A");
    expect(formatMinutes(0)).toBe("N/A");
  });
});
