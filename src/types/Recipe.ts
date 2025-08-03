export type Recipe = {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
};