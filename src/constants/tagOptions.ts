export const tagValues = [
  null,
  "Chicken",
  "Pork",
  "Beef",
  "Fish",
  "Vegan",
  "Dessert",
  "Lactose-free",
  "Low-Sugar",
  "Cake",
] as const;

export type TagFilter = (typeof tagValues)[number];
