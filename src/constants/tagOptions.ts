import type { HandleNullString } from "~/utils/types";

// Tag definitions with translation key mappings
export const tagDefinitions = {
  null: "all",
  Chicken: "chicken",
  Pork: "pork",
  Beef: "beef",
  Fish: "fish",
  Vegan: "vegan",
  Dessert: "dessert",
  "Lactose-free": "lactoseFree",
  "Low-Sugar": "lowSugar",
  Cake: "cake",
} as const;

export const tagValues = Object.keys(tagDefinitions).map((key) =>
  key === "null" ? null : key,
) as ReadonlyArray<string | null>;

export type TagFilter = HandleNullString<keyof typeof tagDefinitions>;
export type TagTranslationKey = (typeof tagDefinitions)[keyof typeof tagDefinitions];
