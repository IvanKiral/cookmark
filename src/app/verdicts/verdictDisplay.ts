import type { RecipeVerdict } from "~/shared/verdicts.ts";
import { verdictStrings } from "./strings.ts";

export const recipeVerdictLabels: Record<RecipeVerdict, string> = {
  "chef-kiss": verdictStrings.chefKiss,
  "chef-approved": verdictStrings.chefApproved,
  "chef-ok": verdictStrings.chefOk,
  "chef-flop": verdictStrings.chefFlop,
};

// Material Symbols names, shared by the badges and the admin toggle buttons.
export const recipeVerdictIcons: Record<RecipeVerdict, string> = {
  "chef-kiss": "chef_hat",
  "chef-approved": "thumb_up",
  "chef-ok": "sentiment_neutral",
  "chef-flop": "thumb_down",
};
