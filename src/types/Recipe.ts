export type Ingredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

export type InstructionSection = {
  name: string;
  steps: ReadonlyArray<string>;
};

export type RecipeData = {
  title: string;
  description: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  ingredients: Ingredient[];
  instructions: ReadonlyArray<InstructionSection>;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | null;
  cuisine: string | null;
  source_url: string | null;
  video_url?: string;
  created_at?: string;
};

export type Recipe = {
  id: string;
  url_slug: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
  total_time: number;
  tags: ReadonlyArray<string>;
  created_at: string;
};
