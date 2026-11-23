import { describe, expect, it } from "vitest";
import { listSortOptions, resolveListSort, sortParamFor } from "./listSort.ts";

describe("list sort", () => {
  it("defaults to Your order inside a manual collection and to Newest elsewhere", () => {
    expect(resolveListSort(undefined, true)).toBe("your-order");
    expect(resolveListSort(undefined, false)).toBe("date-desc");
    expect(listSortOptions(true)[0]?.value).toBe("your-order");
    expect(listSortOptions(false).some((option) => option.value === "your-order")).toBe(false);
  });

  it("writes Newest inside a manual collection, so the choice sticks", () => {
    expect(sortParamFor("date-desc", true)).toBe("date-desc");
    expect(resolveListSort("date-desc", true)).toBe("date-desc");
  });

  it("removes the param for the place's default", () => {
    expect(sortParamFor("your-order", true)).toBeUndefined();
    expect(sortParamFor("date-desc", false)).toBeUndefined();
    expect(sortParamFor("name-asc", false)).toBe("name-asc");
  });
});
