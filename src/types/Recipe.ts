export type Ingredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

export type RecipeData = {
  title: string;
  description: string;
  prep_time: string | null;
  cook_time: string | null;
  total_time: string | null;
  servings: number | null;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  cuisine: string | null;
};

export type Recipe = {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
};