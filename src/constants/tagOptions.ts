export const tagValues = [
  "Chicken",
  "Pork",
  "Beef",
  "Fish",
  "Vegan",
  "Dessert",
  "Lactose-free",
  "Low-Sugar",
  "Cake",
  "Vegetarian",
  "Eggs",
  "Air-fryer",
  "Slowcooker",
  "Meal-prep",
  "Legumes",
  "Soup",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
] as const;

export type TagValue = (typeof tagValues)[number];
export type TagFilter = ReadonlyArray<TagValue>;
