import { describe, expect, it } from "vitest";
import { matchesRecommendedFilter, NO_VERDICT } from "./recommendedOptions.ts";

describe("matchesRecommendedFilter", () => {
  it("matches every recipe when nothing is selected", () => {
    expect(matchesRecommendedFilter(undefined, [])).toBe(true);
    expect(matchesRecommendedFilter("chef-flop", [])).toBe(true);
  });

  it("matches recipes with a selected verdict", () => {
    expect(matchesRecommendedFilter("chef-kiss", ["chef-kiss", "chef-ok"])).toBe(true);
    expect(matchesRecommendedFilter("chef-flop", ["chef-kiss", "chef-ok"])).toBe(false);
    expect(matchesRecommendedFilter(undefined, ["chef-kiss"])).toBe(false);
  });

  it("matches recipes without a verdict when No verdict is selected", () => {
    expect(matchesRecommendedFilter(undefined, [NO_VERDICT])).toBe(true);
    expect(matchesRecommendedFilter("chef-ok", [NO_VERDICT])).toBe(false);
  });

  it("combines No verdict with other verdicts as a union", () => {
    expect(matchesRecommendedFilter(undefined, ["chef-kiss", NO_VERDICT])).toBe(true);
    expect(matchesRecommendedFilter("chef-kiss", ["chef-kiss", NO_VERDICT])).toBe(true);
    expect(matchesRecommendedFilter("chef-ok", ["chef-kiss", NO_VERDICT])).toBe(false);
  });
});
