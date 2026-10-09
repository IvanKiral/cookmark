import { createSetRecipeFlagHandler } from "~/lib/recipeFlagStore.ts";

export const PUT = createSetRecipeFlagHandler("should-delete", true);
export const DELETE = createSetRecipeFlagHandler("should-delete", false);
