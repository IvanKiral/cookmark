export const tagDefinitions = {
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

export const tagValues = Object.keys(tagDefinitions) as ReadonlyArray<TagValue>;

export type TagValue = keyof typeof tagDefinitions;
export type TagFilter = ReadonlyArray<TagValue>;
export type TagTranslationKey = (typeof tagDefinitions)[keyof typeof tagDefinitions];
