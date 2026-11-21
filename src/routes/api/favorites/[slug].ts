import { createAddMarkHandler, createRemoveMarkHandler } from "~/server/marks/markHandlers.ts";

export const PUT = createAddMarkHandler("favorite");
export const DELETE = createRemoveMarkHandler("favorite");
