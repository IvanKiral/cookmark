import { describe, expect, it } from "vitest";
import type { Collection } from "~/shared/collections.ts";
import { getNameError } from "./collectionNames.ts";

const soups: Collection = {
  id: "soups",
  name: "Soups",
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs: [],
};

describe("getNameError", () => {
  it("accepts a new name", () => {
    expect(getNameError("Stews", [soups])).toBeUndefined();
  });

  it("rejects empty, space-only and long names", () => {
    expect(getNameError("   ", [soups])).toBe("Give it a name.");
    expect(getNameError("x".repeat(61), [soups])).toBe("Keep it under 60 characters.");
  });

  it("rejects a name taken ignoring ASCII case, except by the collection itself", () => {
    expect(getNameError(" soups ", [soups])).toBe("You already have a collection called soups.");
    expect(getNameError("SOUPS", [soups], "soups")).toBeUndefined();
  });
});
