import { describe, expect, it } from "vitest";
import type { Collection } from "~/shared/collections.ts";
import { placeMetaOf, placeSubtitleOf, placeTitleOf } from "./placeText.ts";

const soups: Collection = {
  id: "soups",
  name: "Soups",
  kind: "manual",
  filters: null,
  pinPosition: null,
  slugs: [],
};

const quick: Collection = {
  ...soups,
  id: "quick",
  name: "Quick",
  kind: "smart",
  filters: { difficulty: [], time: ["under30"], tag: ["Soup"], author: [], recommended: [] },
};

describe("placeTitleOf", () => {
  it("names the place, or the collection being filled", () => {
    expect(placeTitleOf({ kind: "all" }, undefined, undefined)).toBe("All recipes");
    expect(placeTitleOf({ kind: "mark", mark: "favorite" }, undefined, undefined)).toBe(
      "Favourites",
    );
    expect(placeTitleOf({ kind: "mark", mark: "to-try" }, undefined, undefined)).toBe("To try");
    expect(placeTitleOf({ kind: "collection", id: "soups" }, soups, undefined)).toBe("Soups");
    expect(placeTitleOf({ kind: "collection", id: "soups" }, soups, soups)).toBe(
      "Add recipes to Soups",
    );
  });
});

describe("placeMetaOf", () => {
  it("counts recipes, with the order or the filter description", () => {
    expect(placeMetaOf(undefined, 1)).toBe("1 recipe");
    expect(placeMetaOf(soups, 3)).toBe("3 recipes, your order");
    expect(placeMetaOf(quick, 2)).toBe("Smart filter: Soup, Under 30 min, 2 recipes");
  });
});

describe("placeSubtitleOf", () => {
  it("shows the pick count, the rename hint or the meta", () => {
    expect(
      placeSubtitleOf({ collection: soups, count: 3, pickableCount: 7, isRenaming: false }),
    ).toBe("Pick from your library, 7 recipes not in this collection yet");
    expect(
      placeSubtitleOf({ collection: soups, count: 3, pickableCount: undefined, isRenaming: true }),
    ).toBe("Enter to save, Esc to cancel");
    expect(
      placeSubtitleOf({ collection: soups, count: 3, pickableCount: undefined, isRenaming: false }),
    ).toBe("3 recipes, your order");
  });
});
