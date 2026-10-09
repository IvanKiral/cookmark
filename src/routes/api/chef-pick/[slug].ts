import { createSetChefPickHandler } from "~/lib/chefPickStore.ts";

export const PUT = createSetChefPickHandler(true);
export const DELETE = createSetChefPickHandler(false);
