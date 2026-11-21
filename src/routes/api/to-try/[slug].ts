import { createAddMarkHandler, createRemoveMarkHandler } from "~/server/marks/markHandlers.ts";

export const PUT = createAddMarkHandler("to-try");
export const DELETE = createRemoveMarkHandler("to-try");
