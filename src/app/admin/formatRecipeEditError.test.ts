import { describe, expect, it } from "vitest";
import { formatRecipeEditError } from "./formatRecipeEditError.ts";

describe("formatRecipeEditError", () => {
  it("turns each error code into a message", () => {
    expect(formatRecipeEditError({ code: "nameRequired" })).toBe("Enter a name.");
    expect(formatRecipeEditError({ code: "invalid" })).toBe("This value is not valid.");
    expect(formatRecipeEditError({ code: "tooLong", maxLength: 30 })).toBe(
      "Keep this to 30 characters or fewer.",
    );
    expect(formatRecipeEditError({ code: "minutes", max: 1440 })).toBe(
      "Enter whole minutes from 0 to 1440.",
    );
    expect(formatRecipeEditError({ code: "unknownTag", tag: "Pizza" })).toBe("Unknown tag: Pizza.");
  });
});
