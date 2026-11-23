import { describe, expect, it } from "vitest";
import { listActiveFilters } from "./activeFilters.ts";
import { emptyFilters } from "./recipeFilters.ts";

describe("listActiveFilters", () => {
  it("lists selected options with labels in panel order, authors last", () => {
    expect(
      listActiveFilters({
        ...emptyFilters,
        author: ["ana"],
        time: ["under30"],
        tag: ["Dinner", "Chicken"],
        recommended: ["chef-kiss"],
      }),
    ).toEqual([
      { key: "recommended", value: "chef-kiss", label: "Chef's kiss" },
      { key: "tag", value: "Dinner", label: "Dinner" },
      { key: "tag", value: "Chicken", label: "Chicken" },
      { key: "time", value: "under30", label: "Under 30 min" },
      { key: "author", value: "ana", label: "ana" },
    ]);
  });
});
