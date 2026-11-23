import { markStrings } from "~/app/marks/strings.ts";
import { verdictStrings } from "~/app/verdicts/strings.ts";
import { recipeVerdictLabels } from "~/app/verdicts/verdictDisplay.ts";
import {
  type DifficultyValue,
  difficultyValues,
  NO_VERDICT,
  type RecommendedValue,
  recommendedValues,
  type TimeValue,
  timeValues,
} from "~/shared/filters.ts";
import { type Mark, markValues } from "~/shared/marks.ts";
import { type TagGroupKey, type TagValue, tagGroupDefinitions, tagValues } from "~/shared/tags.ts";
import { filterStrings } from "./strings.ts";

const difficultyLabels: Record<DifficultyValue, string> = {
  Easy: filterStrings.easy,
  Medium: filterStrings.medium,
  Hard: filterStrings.hard,
};

const timeLabels: Record<TimeValue, string> = {
  under30: filterStrings.under30,
  under60: filterStrings.under60,
  over60: filterStrings.over60,
};

const markLabels: Record<Mark, string> = {
  favorite: markStrings.favorites,
  "to-try": markStrings.toTry,
};

const recommendedLabels: Record<RecommendedValue, string> = {
  ...recipeVerdictLabels,
  [NO_VERDICT]: verdictStrings.noVerdict,
};

const tagLabels: Record<TagValue, string> = {
  Chicken: filterStrings.tags.chicken,
  Pork: filterStrings.tags.pork,
  Beef: filterStrings.tags.beef,
  Fish: filterStrings.tags.fish,
  Vegan: filterStrings.tags.vegan,
  Dessert: filterStrings.tags.dessert,
  "Lactose-free": filterStrings.tags.lactoseFree,
  "Low-Sugar": filterStrings.tags.lowSugar,
  Cake: filterStrings.tags.cake,
  Vegetarian: filterStrings.tags.vegetarian,
  Eggs: filterStrings.tags.eggs,
  "Air-fryer": filterStrings.tags.airFryer,
  Slowcooker: filterStrings.tags.slowcooker,
  "Meal-prep": filterStrings.tags.mealPrep,
  Legumes: filterStrings.tags.legumes,
  Soup: filterStrings.tags.soup,
  Breakfast: filterStrings.tags.breakfast,
  Lunch: filterStrings.tags.lunch,
  Dinner: filterStrings.tags.dinner,
  Snack: filterStrings.tags.snack,
};

export const difficultyOptions = difficultyValues.map((value) => ({
  value,
  label: difficultyLabels[value],
}));

export const timeOptions = timeValues.map((value) => ({
  value,
  label: timeLabels[value],
}));

export const markOptions = markValues.map((value) => ({
  value,
  label: markLabels[value],
}));

export const recommendedOptions = recommendedValues.map((value) => ({
  value,
  label: recommendedLabels[value],
}));

export const tagOptions = tagValues.map((value) => ({
  value,
  label: tagLabels[value],
}));

const buildTagOptions = (values: ReadonlyArray<TagValue>) =>
  values.map((value) => ({ value, label: tagLabels[value] }));

const tagGroupLabels: Record<TagGroupKey, string> = {
  meal: filterStrings.meal,
  protein: filterStrings.protein,
  type: filterStrings.type,
  method: filterStrings.method,
  diet: filterStrings.diet,
};

export const tagGroups = tagGroupDefinitions.map((group) => ({
  label: tagGroupLabels[group.key],
  options: buildTagOptions(group.values),
}));
