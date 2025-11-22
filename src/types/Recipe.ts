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
  difficulty: "easy" | "medium" | "hard" | null;
  cuisine: string | null;
  source_url: string | null;
};

export type Recipe = {
  id: string;
  url_slug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
  total_time: number;
  tags: ReadonlyArray<string>;
};
