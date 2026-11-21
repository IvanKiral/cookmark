import { describe, expect, it } from "vitest";
import {
  parseArrayParam,
  parsePageParam,
  parseStringParam,
  serializeArrayParam,
} from "./searchParams.ts";

describe("search params", () => {
  it("parses comma separated values and drops unknown ones", () => {
    expect(parseArrayParam("Soup,Pizza,Vegan", ["Soup", "Vegan"])).toEqual(["Soup", "Vegan"]);
    expect(parseArrayParam(["Soup", "Pizza"], ["Soup"])).toEqual(["Soup"]);
    expect(parseArrayParam(undefined, ["Soup"])).toEqual([]);
  });

  it("serializes values and removes an empty param", () => {
    expect(serializeArrayParam(["Soup", "Vegan"])).toBe("Soup,Vegan");
    expect(serializeArrayParam([])).toBeUndefined();
  });

  it("reads a single string", () => {
    expect(parseStringParam("soup")).toBe("soup");
    expect(parseStringParam(["soup"])).toBe("");
    expect(parseStringParam(undefined)).toBe("");
  });

  it("falls back to the first page", () => {
    expect(parsePageParam("3")).toBe(3);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam(undefined)).toBe(1);
  });
});
