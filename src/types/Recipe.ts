export type Ingredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

export type RecipeData = {
  title: string;
  description: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  cuisine: string | null;
  "source-url": string | null;
};

export type Recipe = {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
  total_time: number;
  tags: ReadonlyArray<string>;
};
