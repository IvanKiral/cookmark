import { strings } from "~/app/strings.ts";
import type { RecipeVerdict } from "~/shared/verdicts.ts";

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
