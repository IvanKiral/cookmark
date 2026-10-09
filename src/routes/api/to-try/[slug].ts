import { createAddMarkHandler, createRemoveMarkHandler } from "~/lib/markHandlers.ts";

export const PUT = createAddMarkHandler("to-try");
export const DELETE = createRemoveMarkHandler("to-try");
