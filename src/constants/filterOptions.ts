import { type DifficultyValue, difficultyValues } from "./difficultyOptions.js";
import { strings } from "./strings.js";
import { type TagValue, tagValues } from "./tagOptions.js";
import { type TimeValue, timeValues } from "./timeOptions.js";

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
  "Meal-prep": strings.tags.mealPrep,
};

export const difficultyOptions = difficultyValues.map((value) => ({
  value,
  label: difficultyLabels[value],
}));

export const timeOptions = timeValues.map((value) => ({
  value,
  label: timeLabels[value],
}));

export const tagOptions = tagValues.map((value) => ({
  value,
  label: tagLabels[value],
}));
