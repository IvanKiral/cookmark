import { describe, expect, it } from "vitest";
import { parseSmartFilters, validateCollectionName } from "./collections.ts";

describe("validateCollectionName", () => {
  it("accepts names of 1 to 60 characters after trimming", () => {
    expect(validateCollectionName("Soups")).toBeUndefined();
    expect(validateCollectionName(` ${"x".repeat(60)} `)).toBeUndefined();
  });

  it("rejects empty and space-only names", () => {
    expect(validateCollectionName("")).toBe("name-empty");
    expect(validateCollectionName("   ")).toBe("name-empty");
  });

  it("rejects names over 60 characters", () => {
    expect(validateCollectionName("x".repeat(61))).toBe("name-too-long");
  });
});

describe("parseSmartFilters", () => {
  it("keeps known values and fills missing groups with empty lists", () => {
    expect(parseSmartFilters({ tag: ["Soup", "Chicken"], time: ["under30"] })).toEqual({
      difficulty: [],
      time: ["under30"],
      tag: ["Soup", "Chicken"],
      author: [],
      recommended: [],
    });
  });

  it("drops unknown values and duplicates and keeps any non-empty author", () => {
    expect(
      parseSmartFilters({
        difficulty: ["Easy", "Impossible", 3],
        tag: ["Soup", "Soup", "Gone"],
        author: ["someone", "", "  ", 4],
        recommended: ["chef-kiss", "no-verdict", "chef-maybe"],
        mark: ["favorite"],
      }),
    ).toEqual({
      difficulty: ["Easy"],
      time: [],
      tag: ["Soup"],
      author: ["someone"],
      recommended: ["chef-kiss", "no-verdict"],
    });
  });

  it("returns undefined for a wrong shape", () => {
    expect(parseSmartFilters(null)).toBeUndefined();
    expect(parseSmartFilters("Soup")).toBeUndefined();
    expect(parseSmartFilters(["Soup"])).toBeUndefined();
    expect(parseSmartFilters({ tag: "Soup" })).toBeUndefined();
  });

  it("returns undefined when nothing is left", () => {
    expect(parseSmartFilters({})).toBeUndefined();
    expect(parseSmartFilters({ tag: ["Gone"], time: [] })).toBeUndefined();
  });
});
