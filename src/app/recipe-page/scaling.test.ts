import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatFactor,
  getAmountStep,
  parseAmount,
  parseTypedAmount,
  roundScaledAmount,
} from "./scaling.ts";

describe("parseAmount", () => {
  it("reads numbers, decimals with a dot or comma and fractions", () => {
    expect(parseAmount(2)).toBe(2);
    expect(parseAmount(0.5)).toBe(0.5);
    expect(parseAmount("0.5")).toBe(0.5);
    expect(parseAmount("1,5")).toBe(1.5);
    expect(parseAmount("1/2")).toBe(0.5);
    expect(parseAmount("1 1/2")).toBe(1.5);
    expect(parseAmount(" 3 ")).toBe(3);
  });

  it("returns undefined for text, empty, null and zero amounts", () => {
    expect(parseAmount("a pinch")).toBeUndefined();
    expect(parseAmount("")).toBeUndefined();
    expect(parseAmount(null)).toBeUndefined();
    expect(parseAmount(0)).toBeUndefined();
    expect(parseAmount("0")).toBeUndefined();
    expect(parseAmount("1/0")).toBeUndefined();
    expect(parseAmount("2-3")).toBeUndefined();
  });
});

describe("roundScaledAmount", () => {
  it("rounds unitless and non-metric amounts to the nearest half, at least 0.5", () => {
    expect(roundScaledAmount(1.6, null)).toBe(1.5);
    expect(roundScaledAmount(1.8, "tbsp")).toBe(2);
    expect(roundScaledAmount(0.1, "tsp")).toBe(0.5);
    expect(roundScaledAmount(2.3, "cloves")).toBe(2.5);
    expect(roundScaledAmount(0.2, "tin")).toBe(0.5);
  });

  it("rounds g and ml to 5 under 100 and to 10 from 100, at least 5", () => {
    expect(roundScaledAmount(64, "g")).toBe(65);
    expect(roundScaledAmount(320, "ml")).toBe(320);
    expect(roundScaledAmount(104, "G")).toBe(100);
    expect(roundScaledAmount(1, "g")).toBe(5);
  });

  it("rounds kg and l to one decimal, at least 0.1", () => {
    expect(roundScaledAmount(0.75, "kg")).toBe(0.8);
    expect(roundScaledAmount(1.23, "l")).toBe(1.2);
    expect(roundScaledAmount(0.01, "kg")).toBe(0.1);
  });
});

describe("formatAmount", () => {
  it("uses a dot, at most one decimal and no trailing .0", () => {
    expect(formatAmount(1.5)).toBe("1.5");
    expect(formatAmount(2)).toBe("2");
    expect(formatAmount(0.25)).toBe("0.3");
    expect(formatAmount(2.04)).toBe("2");
    expect(formatAmount(400)).toBe("400");
  });
});

describe("getAmountStep", () => {
  it("steps g and ml by 10, kg and l by 0.1, everything else by 1", () => {
    expect(getAmountStep("g")).toBe(10);
    expect(getAmountStep("ml")).toBe(10);
    expect(getAmountStep("kg")).toBe(0.1);
    expect(getAmountStep("l")).toBe(0.1);
    expect(getAmountStep("tbsp")).toBe(1);
    expect(getAmountStep(null)).toBe(1);
  });
});

describe("parseTypedAmount", () => {
  it("accepts a dot or a comma and rejects empty, zero and text", () => {
    expect(parseTypedAmount("1,5")).toBe(1.5);
    expect(parseTypedAmount("400")).toBe(400);
    expect(parseTypedAmount("")).toBeUndefined();
    expect(parseTypedAmount("0")).toBeUndefined();
    expect(parseTypedAmount("abc")).toBeUndefined();
  });
});

describe("formatFactor", () => {
  it("keeps up to two decimals", () => {
    expect(formatFactor(1.6)).toBe("1.6");
    expect(formatFactor(1 / 3)).toBe("0.33");
    expect(formatFactor(2)).toBe("2");
  });
});
