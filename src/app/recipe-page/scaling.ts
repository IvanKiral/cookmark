const DECIMAL = /^\d+(?:[.,]\d+)?$/;
const FRACTION = /^(\d+)\/(\d+)$/;
const MIXED_FRACTION = /^(\d+)\s+(\d+)\/(\d+)$/;

const positive = (value: number): number | undefined =>
  Number.isFinite(value) && value > 0 ? value : undefined;

const parseAmountText = (text: string): number | undefined => {
  if (DECIMAL.test(text)) {
    return positive(Number(text.replace(",", ".")));
  }
  const fraction = FRACTION.exec(text);
  if (fraction) {
    return positive(Number(fraction[1]) / Number(fraction[2]));
  }
  const mixed = MIXED_FRACTION.exec(text);
  if (mixed) {
    return positive(Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]));
  }
  return undefined;
};

// 2, 0.5, "0.5", "1,5", "1/2", "1 1/2" → numbers; "a pinch", "", null, 0 → undefined.
export const parseAmount = (amount: string | number | null): number | undefined => {
  if (amount === null) {
    return undefined;
  }
  if (typeof amount === "number") {
    return positive(amount);
  }
  return parseAmountText(amount.trim());
};

const normalizeUnit = (unit: string | null): string => (unit ?? "").trim().toLowerCase();

const roundTo = (value: number, step: number): number => Math.round(value / step) * step;

// Avoids float noise such as 0.30000000000000004 after rounding to tenths.
const toTenths = (value: number): number => Math.round(value * 10) / 10;

// Rounds a scaled value by unit (behavior.md, section 8).
export const roundScaledAmount = (value: number, unit: string | null): number => {
  const normalized = normalizeUnit(unit);
  if (normalized === "g" || normalized === "ml") {
    return Math.max(5, value < 100 ? roundTo(value, 5) : roundTo(value, 10));
  }
  if (normalized === "kg" || normalized === "l") {
    return Math.max(0.1, toTenths(value));
  }
  return Math.max(0.5, roundTo(value, 0.5));
};

// Dot decimal, at most one decimal place, no trailing ".0": 1.5 → "1.5", 2 → "2", 0.25 → "0.3".
export const formatAmount = (value: number): string => String(toTenths(value));

// The step of ArrowUp/ArrowDown in an amount input; servings have no unit and step by 1.
export const getAmountStep = (unit: string | null): number => {
  const normalized = normalizeUnit(unit);
  if (normalized === "g" || normalized === "ml") {
    return 10;
  }
  if (normalized === "kg" || normalized === "l") {
    return 0.1;
  }
  return 1;
};

// What the user typed into an amount input: a positive number with a dot or a
// comma, anything else is undefined (and shows the original amounts).
export const parseTypedAmount = (text: string): number | undefined => {
  const trimmed = text.trim();
  if (trimmed === "") {
    return undefined;
  }
  return positive(Number(trimmed.replace(",", ".")));
};

// "×1.6": the factor with up to 2 decimals.
export const formatFactor = (factor: number): string => String(Math.round(factor * 100) / 100);
