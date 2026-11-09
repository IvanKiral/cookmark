import { strings } from "./strings.ts";

// The admins' verdict on a recipe, global for every visitor. A recipe holds at
// most one (the recipes.verdict column). Ordered from best to worst, which is
// also the order of the toggle buttons and the filter options. Set through
// /api/verdict/<slug>.
export const recipeVerdictValues = ["chef-kiss", "chef-approved", "chef-ok", "chef-flop"] as const;

export type RecipeVerdict = (typeof recipeVerdictValues)[number];

export const isRecipeVerdict = (value: unknown): value is RecipeVerdict =>
  recipeVerdictValues.some((verdict) => verdict === value);

export const recipeVerdictLabels: Record<RecipeVerdict, string> = {
  "chef-kiss": strings.verdicts.chefKiss,
  "chef-approved": strings.verdicts.chefApproved,
  "chef-ok": strings.verdicts.chefOk,
  "chef-flop": strings.verdicts.chefFlop,
};

// Material Symbols names, shared by the badges and the admin toggle buttons.
export const recipeVerdictIcons: Record<RecipeVerdict, string> = {
  "chef-kiss": "chef_hat",
  "chef-approved": "thumb_up",
  "chef-ok": "sentiment_neutral",
  "chef-flop": "thumb_down",
};
