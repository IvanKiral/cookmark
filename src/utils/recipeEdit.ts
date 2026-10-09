import { strings } from "~/constants/strings.ts";
import { type TagValue, tagValues } from "~/constants/tagOptions.ts";
import type { RecipeData } from "~/types/Recipe.ts";

// The recipe fields an admin can edit. Shared by the edit form (instant
// feedback) and the API (the actual check), so both apply the same rules.
export type RecipeEdit = {
  title: string;
  description: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  tags: ReadonlyArray<TagValue>;
};

export type RecipeEditField = keyof RecipeEdit;
export type RecipeEditErrors = Partial<Record<RecipeEditField, string>>;

export type RecipeEditResult =
  | { isValid: true; edit: RecipeEdit }
  | { isValid: false; errors: RecipeEditErrors };

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_MINUTES = 1440;

type Parsed<T> = { isValid: true; value: T } | { isValid: false; error: string };

const errors = strings.recipeEdit.errors;

const valid = <T>(value: T): Parsed<T> => ({ isValid: true, value });
const invalid = <T>(error: string): Parsed<T> => ({ isValid: false, error });

const isTagValue = (value: unknown): value is TagValue => tagValues.some((tag) => tag === value);

const parseTitle = (value: unknown): Parsed<string> => {
  const title = typeof value === "string" ? value.trim() : "";
  if (title === "") {
    return invalid(errors.nameRequired);
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return invalid(errors.nameTooLong(MAX_TITLE_LENGTH));
  }
  return valid(title);
};

const parseDescription = (value: unknown): Parsed<string> => {
  if (typeof value !== "string") {
    return invalid(errors.invalid);
  }
  const description = value.trim();
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return invalid(errors.descriptionTooLong(MAX_DESCRIPTION_LENGTH));
  }
  return valid(description);
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseRecipeEdit = (input: unknown): RecipeEditResult => {
  const body = isRecord(input) ? input : {};
  const fields = {
    title: parseTitle(body.title),
    description: parseDescription(body.description),
    prep_time: parseMinutes(body.prep_time),
    cook_time: parseMinutes(body.cook_time),
    total_time: parseMinutes(body.total_time),
    tags: parseTags(body.tags),
  };

  if (
    !(
      fields.title.isValid &&
      fields.description.isValid &&
      fields.prep_time.isValid &&
      fields.cook_time.isValid &&
      fields.total_time.isValid &&
      fields.tags.isValid
    )
  ) {
    const fieldErrors = Object.entries(fields).flatMap(([field, result]) =>
      result.isValid ? [] : [[field, result.error] as const],
    );
    return { isValid: false, errors: Object.fromEntries(fieldErrors) };
  }

  return {
    isValid: true,
    edit: {
      title: fields.title.value,
      description: fields.description.value,
      prep_time: fields.prep_time.value,
      cook_time: fields.cook_time.value,
      total_time: fields.total_time.value,
      tags: fields.tags.value,
    },
  };
};

// Only the edited fields change; ingredients, instructions, source, video,
// author and dates are kept as they are.
export const applyRecipeEdit = (data: RecipeData, edit: RecipeEdit): RecipeData => ({
  ...data,
  title: edit.title,
  description: edit.description,
  prep_time: edit.prep_time,
  cook_time: edit.cook_time,
  total_time: edit.total_time,
  tags: [...edit.tags],
});

// Starting values for the edit form. A missing total is pre-filled with prep +
// cook when either is known. Tags outside the known list are dropped (none
// exist in production as of the 0007 migration).
// Older recipe JSON may omit fields entirely, hence the ?? fallbacks.
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
  };
};
