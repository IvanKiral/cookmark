import { createSetRecipeFlagHandler } from "~/lib/recipeFlagStore.ts";

export const PUT = createSetRecipeFlagHandler("chef-pick", true);
export const DELETE = createSetRecipeFlagHandler("chef-pick", false);
