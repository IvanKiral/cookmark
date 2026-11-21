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

export type TagGroupKey = "meal" | "protein" | "type" | "method" | "diet";

// "any": a recipe matches if it has at least one selected tag of the group (e.g. Chicken or Pork).
// "all": a recipe must have every selected tag of the group (e.g. Vegan and Lactose-free).
export type TagMatchMode = "any" | "all";

export type TagGroup = {
  readonly key: TagGroupKey;
  readonly match: TagMatchMode;
  readonly values: ReadonlyArray<TagValue>;
};

export const tagGroupDefinitions: ReadonlyArray<TagGroup> = [
  { key: "meal", match: "any", values: ["Breakfast", "Lunch", "Dinner", "Snack"] },
  {
    key: "protein",
    match: "any",
    values: ["Chicken", "Pork", "Beef", "Fish", "Eggs", "Legumes"],
  },
  { key: "type", match: "any", values: ["Soup", "Dessert", "Cake", "Meal-prep"] },
  { key: "method", match: "any", values: ["Air-fryer", "Slowcooker"] },
  { key: "diet", match: "all", values: ["Vegan", "Vegetarian", "Lactose-free", "Low-Sugar"] },
];
