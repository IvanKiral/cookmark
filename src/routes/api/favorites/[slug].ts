import { createAddMarkHandler, createRemoveMarkHandler } from "~/lib/markHandlers.ts";

export const PUT = createAddMarkHandler("favorite");
export const DELETE = createRemoveMarkHandler("favorite");
