import type { APIEvent } from "@solidjs/start/server";
import { getRecipeInboxDb, insertLink, normalizeUrl, readPending } from "~/lib/recipeInboxStore.ts";

export const GET = async (): Promise<Response> => {
  const db = getRecipeInboxDb();
  if (!db) {
    return new Response("Recipe inbox unavailable", { status: 500 });
  }
  const links = await readPending(db);
  return Response.json({ links });
};

export const POST = async (event: APIEvent): Promise<Response> => {
  const db = getRecipeInboxDb();
  if (!db) {
    return new Response("Recipe inbox unavailable", { status: 500 });
  }
  const body = (await event.request.json().catch(() => undefined)) as { url?: unknown } | undefined;
  const rawUrl = body?.url;
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return new Response("Missing 'url'", { status: 400 });
  }
  const url = normalizeUrl(rawUrl);
  if (!url) {
    return new Response("Invalid 'url'", { status: 400 });
  }
  const status = await insertLink(db, url, new Date().toISOString());
  return Response.json({ status, url });
};
