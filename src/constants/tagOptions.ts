export const tagOptions = [
  { value: null, label: "All" },
  { value: "Chicken", label: "Chicken" },
  { value: "Pork", label: "Pork" },
  { value: "Beef", label: "Beef" },
  { value: "Fish", label: "Fish" },
  { value: "Vegan", label: "Vegan" },
  { value: "Dessert", label: "Dessert" },
  { value: "Lactose-free", label: "Lactose-free" },
  { value: "Low-Sugar", label: "Low-Sugar" },
  { value: "Cake", label: "Cake" },
] as const;

export type TagFilter = (typeof tagOptions)[number]["value"];