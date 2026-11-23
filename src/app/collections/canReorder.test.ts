import { describe, expect, it } from "vitest";
import { canReorderPlace, type ReorderConditions } from "./canReorder.ts";

const possible: ReorderConditions = {
  isManualCollection: true,
  isSelecting: false,
  activeFilterCount: 0,
  searchQuery: "",
  sort: "your-order",
  recipeCount: 2,
};

describe("canReorderPlace", () => {
  it("allows a manual collection of several recipes in its own order", () => {
    expect(canReorderPlace(possible)).toBe(true);
  });

  it("is hidden with filters or search active", () => {
    expect(canReorderPlace({ ...possible, activeFilterCount: 1 })).toBe(false);
    expect(canReorderPlace({ ...possible, searchQuery: "soup" })).toBe(false);
  });

  it("is hidden for smart filters, another sort, one recipe or in select mode", () => {
    expect(canReorderPlace({ ...possible, isManualCollection: false })).toBe(false);
    expect(canReorderPlace({ ...possible, sort: "date-desc" })).toBe(false);
    expect(canReorderPlace({ ...possible, recipeCount: 1 })).toBe(false);
    expect(canReorderPlace({ ...possible, isSelecting: true })).toBe(false);
  });
});
