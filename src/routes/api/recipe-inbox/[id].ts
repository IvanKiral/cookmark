import type { APIEvent } from "@solidjs/start/server";
import { getRecipeInboxDb, markProcessed } from "~/lib/recipeInboxStore.ts";

export const PATCH = async (event: APIEvent): Promise<Response> => {
  const db = getRecipeInboxDb();
  if (!db) {
    return new Response("Recipe inbox unavailable", { status: 500 });
  }
  const id = Number(event.params.id);
  if (!Number.isInteger(id)) {
    return new Response("Invalid id", { status: 400 });
  }
  const body = (await event.request.json().catch(() => undefined)) as
    | { status?: unknown }
    | undefined;
  const status = body?.status;
  if (status !== "done" && status !== "failed") {
    return new Response("status must be 'done' or 'failed'", { status: 400 });
  }
  const updated = await markProcessed(db, id, status);
  if (!updated) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(null, { status: 204 });
};
