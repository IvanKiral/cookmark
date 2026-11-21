import { type DifficultyValue, difficultyValues } from "./difficultyOptions.ts";
import { type Mark, markValues } from "./markOptions.ts";
import { recipeVerdictLabels } from "./recipeVerdicts.ts";
import { NO_VERDICT, type RecommendedValue, recommendedValues } from "./recommendedOptions.ts";
import { strings } from "./strings.ts";
import { type TagGroupKey, type TagValue, tagGroupDefinitions, tagValues } from "./tagOptions.ts";
import { type TimeValue, timeValues } from "./timeOptions.ts";

const difficultyLabels: Record<DifficultyValue, string> = {
  Easy: strings.filters.easy,
  Medium: strings.filters.medium,
  Hard: strings.filters.hard,
};

const timeLabels: Record<TimeValue, string> = {
  under30: strings.filters.under30,
  under60: strings.filters.under60,
  over60: strings.filters.over60,
};

const markLabels: Record<Mark, string> = {
  favorite: strings.marks.favorites,
  "to-try": strings.marks.toTry,
};

const recommendedLabels: Record<RecommendedValue, string> = {
  ...recipeVerdictLabels,
  [NO_VERDICT]: strings.verdicts.noVerdict,
};

const tagLabels: Record<TagValue, string> = {
  Chicken: strings.tags.chicken,
  Pork: strings.tags.pork,
  Beef: strings.tags.beef,
  Fish: strings.tags.fish,
  Vegan: strings.tags.vegan,
  Dessert: strings.tags.dessert,
  "Lactose-free": strings.tags.lactoseFree,
  "Low-Sugar": strings.tags.lowSugar,
  Cake: strings.tags.cake,
  Vegetarian: strings.tags.vegetarian,
  Eggs: strings.tags.eggs,
  "Air-fryer": strings.tags.airFryer,
  Slowcooker: strings.tags.slowcooker,
  "Meal-prep": strings.tags.mealPrep,
  Legumes: strings.tags.legumes,
  Soup: strings.tags.soup,
  Breakfast: strings.tags.breakfast,
  Lunch: strings.tags.lunch,
  Dinner: strings.tags.dinner,
  Snack: strings.tags.snack,
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
  meal: strings.filters.meal,
  protein: strings.filters.protein,
  type: strings.filters.type,
  method: strings.filters.method,
  diet: strings.filters.diet,
};

export const tagGroups = tagGroupDefinitions.map((group) => ({
  label: tagGroupLabels[group.key],
  options: buildTagOptions(group.values),
}));
