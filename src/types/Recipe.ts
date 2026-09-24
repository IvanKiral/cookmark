export type Ingredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

export type InstructionSection = {
  name: string;
  steps: ReadonlyArray<string>;
};

// Mirrors RecipeSource from owl-sight. Recipes published before source_type
// existed carry neither field, so both stay optional.
export type RecipeSourceType =
  | "youtube_video"
  | "youtube_short"
  | "instagram_reel"
  | "video"
  | "website"
  | "image";

export type RecipeSourceFile = {
  key: string;
  mime_type: "image/jpeg" | "image/png" | "application/pdf";
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
  source_url?: string | null;
  source_type?: RecipeSourceType;
  source_file?: RecipeSourceFile;
  author?: string;
  video_url?: string;
  created_at?: string;
};

export type Recipe = {
  id: string;
  url_slug: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unknown";
  time: string;
  total_time: number;
  tags: ReadonlyArray<string>;
  ingredients: ReadonlyArray<string>;
  author?: string;
  image_url: string;
  created_at: string;
};
