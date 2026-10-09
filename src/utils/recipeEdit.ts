import { strings } from "~/constants/strings.ts";
import { type TagValue, tagValues } from "~/constants/tagOptions.ts";
import type { Ingredient, InstructionSection, RecipeData } from "~/types/Recipe.ts";

// The recipe fields an admin can edit. Shared by the edit form (instant
// feedback) and the API (the actual check), so both apply the same rules.
// The form only edits existing ingredients and steps; the lists themselves
// are accepted as sent.
export type RecipeEdit = {
  title: string;
  description: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  tags: ReadonlyArray<TagValue>;
  ingredients: ReadonlyArray<Ingredient>;
  instructions: ReadonlyArray<InstructionSection>;
};

// Keyed by field path, e.g. "title", "ingredients.2.name" or "instructions.0.steps.3".
export type RecipeEditErrors = Partial<Record<string, string>>;

export type RecipeEditResult =
  | { isValid: true; edit: RecipeEdit }
  | { isValid: false; errors: RecipeEditErrors };

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_MINUTES = 1440;
export const MAX_AMOUNT_LENGTH = 20;
export const MAX_UNIT_LENGTH = 30;
export const MAX_INGREDIENT_LENGTH = 200;
export const MAX_SECTION_NAME_LENGTH = 120;
export const MAX_STEP_LENGTH = 2000;
const MAX_INGREDIENTS = 100;
const MAX_SECTIONS = 20;
const MAX_STEPS = 100;

// Errors are keyed by path relative to the value being parsed ("" is the value itself).
type Parsed<T> = { isValid: true; value: T } | { isValid: false; errors: RecipeEditErrors };

type ParsedFields<T> = { [K in keyof T]: Parsed<T[K]> };

const errors = strings.recipeEdit.errors;

const valid = <T>(value: T): Parsed<T> => ({ isValid: true, value });
const invalid = <T>(message: string): Parsed<T> => ({ isValid: false, errors: { "": message } });

const prefixErrors = (prefix: string, fieldErrors: RecipeEditErrors): RecipeEditErrors =>
  Object.fromEntries(
    Object.entries(fieldErrors).map(([path, message]) => [
      path === "" ? prefix : `${prefix}.${path}`,
      message,
    ]),
  );

// Combines per-key results into one, prefixing each error with its key.
const combine = <T>(fields: ParsedFields<T>): Parsed<T> => {
  const entries = Object.entries(fields) as Array<[string, Parsed<unknown>]>;
  const failures = entries.flatMap(([key, result]) =>
    result.isValid ? [] : [prefixErrors(key, result.errors)],
  );
  if (failures.length > 0) {
    return { isValid: false, errors: Object.assign({}, ...failures) };
  }
  // Every entry is valid here, so the object has exactly T's keys and values.
  return valid(
    Object.fromEntries(
      entries.map(([key, result]) => [key, result.isValid ? result.value : undefined]),
    ) as T,
  );
};

const combineList = <T>(results: ReadonlyArray<Parsed<T>>): Parsed<ReadonlyArray<T>> => {
  const failures = results.flatMap((result, index) =>
    result.isValid ? [] : [prefixErrors(String(index), result.errors)],
  );
  if (failures.length > 0) {
    return { isValid: false, errors: Object.assign({}, ...failures) };
  }
  return valid(results.flatMap((result) => (result.isValid ? [result.value] : [])));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTagValue = (value: unknown): value is TagValue => tagValues.some((tag) => tag === value);

type TextRule = {
  maxLength: number;
  // Set for required text; also used when the value isn't text at all.
  requiredError?: string;
};

const parseText = (value: unknown, rule: TextRule): Parsed<string> => {
  if (typeof value !== "string") {
    return invalid(rule.requiredError ?? errors.invalid);
  }
  const text = value.trim();
  if (rule.requiredError && text === "") {
    return invalid(rule.requiredError);
  }
  if (text.length > rule.maxLength) {
    return invalid(errors.tooLong(rule.maxLength));
  }
  return valid(text);
};

// Missing, null or blank text is stored as null.
const parseOptionalText = (value: unknown, maxLength: number): Parsed<string | null> => {
  if (value === null || value === undefined) {
    return valid(null);
  }
  const text = parseText(value, { maxLength });
  if (!text.isValid) {
    return text;
  }
  return valid(text.value === "" ? null : text.value);
};

const NUMERIC_AMOUNT = /^\d+([.,]\d+)?$/;

// A plain number typed as text ("2", "0,5") is stored as a number, like the
// published recipes; anything else ("1/2", "2-3") stays text.
const parseAmount = (value: unknown): Parsed<string | number | null> => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? valid(value) : invalid(errors.invalid);
  }
  const text = parseOptionalText(value, MAX_AMOUNT_LENGTH);
  if (!text.isValid || text.value === null) {
    return text;
  }
  return valid(NUMERIC_AMOUNT.test(text.value) ? Number(text.value.replace(",", ".")) : text.value);
};

// null means unknown, which the recipe page shows as "N/A".
const parseMinutes = (value: unknown): Parsed<number | null> => {
  if (value === null) {
    return valid(null);
  }
  const isWholeMinutes =
    typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_MINUTES;
  return isWholeMinutes ? valid(value) : invalid(errors.minutes(MAX_MINUTES));
};

const parseTags = (value: unknown): Parsed<ReadonlyArray<TagValue>> => {
  if (!Array.isArray(value)) {
    return invalid(errors.invalid);
  }
  const unknownTag = value.find((tag) => !isTagValue(tag));
  if (unknownTag !== undefined) {
    return invalid(errors.unknownTag(String(unknownTag)));
  }
  return valid([...new Set(value.filter(isTagValue))]);
};

const parseList = <T>(
  value: unknown,
  maxItems: number,
  parseItem: (item: unknown) => Parsed<T>,
): Parsed<ReadonlyArray<T>> => {
  if (!Array.isArray(value) || value.length > maxItems) {
    return invalid(errors.invalid);
  }
  return combineList(value.map(parseItem));
};

const parseIngredient = (value: unknown): Parsed<Ingredient> => {
  const item = isRecord(value) ? value : {};
  return combine<Ingredient>({
    name: parseText(item.name, {
      maxLength: MAX_INGREDIENT_LENGTH,
      requiredError: errors.ingredientRequired,
    }),
    amount: parseAmount(item.amount),
    unit: parseOptionalText(item.unit, MAX_UNIT_LENGTH),
  });
};

const parseSection = (value: unknown): Parsed<InstructionSection> => {
  const item = isRecord(value) ? value : {};
  return combine<InstructionSection>({
    name: parseText(item.name, {
      maxLength: MAX_SECTION_NAME_LENGTH,
      requiredError: errors.sectionNameRequired,
    }),
    steps: parseList(item.steps, MAX_STEPS, (step) =>
      parseText(step, { maxLength: MAX_STEP_LENGTH, requiredError: errors.stepRequired }),
    ),
  });
};

export const parseRecipeEdit = (input: unknown): RecipeEditResult => {
  const body = isRecord(input) ? input : {};
  const result = combine<RecipeEdit>({
    title: parseText(body.title, {
      maxLength: MAX_TITLE_LENGTH,
      requiredError: errors.nameRequired,
    }),
    description: parseText(body.description, { maxLength: MAX_DESCRIPTION_LENGTH }),
    prep_time: parseMinutes(body.prep_time),
    cook_time: parseMinutes(body.cook_time),
    total_time: parseMinutes(body.total_time),
    tags: parseTags(body.tags),
    ingredients: parseList(body.ingredients, MAX_INGREDIENTS, parseIngredient),
    instructions: parseList(body.instructions, MAX_SECTIONS, parseSection),
  });
  return result.isValid
    ? { isValid: true, edit: result.value }
    : { isValid: false, errors: result.errors };
};

// Only the edited fields change; source, video, author, servings, difficulty
// and dates are kept as they are.
export const applyRecipeEdit = (data: RecipeData, edit: RecipeEdit): RecipeData => ({
  ...data,
  title: edit.title,
  description: edit.description,
  prep_time: edit.prep_time,
  cook_time: edit.cook_time,
  total_time: edit.total_time,
  tags: [...edit.tags],
  ingredients: edit.ingredients.map((ingredient) => ({ ...ingredient })),
  instructions: edit.instructions.map((section) => ({ ...section, steps: [...section.steps] })),
});

// Starting values for the edit form. A missing total is pre-filled with prep +
// cook when either is known. Amounts become text for the input (2 -> "2").
// Tags outside the known list are dropped (none exist in production as of
// the 0007 migration). Older recipe JSON may omit fields, hence the ?? fallbacks.
export const getInitialRecipeEdit = (data: RecipeData): RecipeEdit => {
  const prepTime = data.prep_time ?? null;
  const cookTime = data.cook_time ?? null;
  const hasPartTimes = prepTime !== null || cookTime !== null;
  const derivedTotal = hasPartTimes ? (prepTime ?? 0) + (cookTime ?? 0) : null;
  return {
    title: data.title,
    description: data.description ?? "",
    prep_time: prepTime,
    cook_time: cookTime,
    total_time: data.total_time ?? derivedTotal,
    tags: (data.tags ?? []).filter(isTagValue),
    ingredients: (data.ingredients ?? []).map((ingredient) => ({
      name: ingredient.name,
      amount:
        ingredient.amount === null || ingredient.amount === undefined
          ? ""
          : String(ingredient.amount),
      unit: ingredient.unit ?? "",
    })),
    instructions: (data.instructions ?? []).map((section) => ({
      name: section.name,
      steps: [...section.steps],
    })),
  };
};
