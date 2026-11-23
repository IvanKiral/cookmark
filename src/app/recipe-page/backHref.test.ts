import { describe, expect, it } from "vitest";
import { backHrefFrom } from "./backHref.ts";

describe("backHrefFrom", () => {
  it("returns to the list with the search it had", () => {
    expect(backHrefFrom({ fromSearch: "?in=favorites&tag=Soup" })).toBe("/?in=favorites&tag=Soup");
  });

  it("falls back to the plain list", () => {
    expect(backHrefFrom(null)).toBe("/");
    expect(backHrefFrom(undefined)).toBe("/");
    expect(backHrefFrom({ fromSearch: "" })).toBe("/");
  });
});
