import { describe, expect, it } from "vitest";
import { tagGroupDefinitions, tagValues } from "~/shared/tags.ts";
import { matchesTagFilter } from "./matchesTagFilter.ts";

const matches = (
  recipeTags: ReadonlyArray<string>,
  selected: Parameters<typeof matchesTagFilter>[1],
): boolean => matchesTagFilter(recipeTags, selected, tagGroupDefinitions);

describe("matchesTagFilter", () => {
  it("matches every recipe when no tag is selected", () => {
    expect(matches([], [])).toBe(true);
    expect(matches(["Chicken"], [])).toBe(true);
  });

  it("uses union within an 'any' group", () => {
    expect(matches(["Chicken"], ["Chicken", "Pork"])).toBe(true);
    expect(matches(["Pork"], ["Chicken", "Pork"])).toBe(true);
    expect(matches(["Beef"], ["Chicken", "Pork"])).toBe(false);
  });

  it("uses intersection across groups", () => {
    expect(matches(["Chicken", "Slowcooker"], ["Chicken", "Slowcooker"])).toBe(true);
    expect(matches(["Chicken"], ["Chicken", "Slowcooker"])).toBe(false);
    expect(matches(["Slowcooker"], ["Chicken", "Slowcooker"])).toBe(false);
  });

  it("combines union within and intersection across groups", () => {
    const selected = ["Chicken", "Pork", "Slowcooker"] as const;
    expect(matches(["Pork", "Slowcooker"], selected)).toBe(true);
    expect(matches(["Chicken", "Pork", "Air-fryer"], selected)).toBe(false);
  });

  it("requires every selected tag within the diet group", () => {
    expect(matches(["Vegan", "Lactose-free"], ["Vegan", "Lactose-free"])).toBe(true);
    expect(matches(["Vegan"], ["Vegan", "Lactose-free"])).toBe(false);
  });

  it("assigns every tag to exactly one group", () => {
    const groupedTags = tagGroupDefinitions.flatMap((group) => group.values);
    expect([...groupedTags].sort()).toEqual([...tagValues].sort());
  });
});
