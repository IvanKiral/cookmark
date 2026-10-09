import type { APIEvent } from "@solidjs/start/server";
import { getUserEmail } from "~/lib/access.ts";
import { addMark, getMarksDb, removeMark } from "~/lib/userMarksStore.ts";
import { getOrCreateUser } from "~/lib/userStore.ts";

export const PUT = async (event: APIEvent): Promise<Response> => {
  const db = getMarksDb();
  if (!db) {
    return new Response("Favorites unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const now = new Date().toISOString();
  await getOrCreateUser(db, email, now);
  await addMark(db, email, event.params.slug, "favorite", now);
  return new Response(null, { status: 204 });
};

export const DELETE = async (event: APIEvent): Promise<Response> => {
  const db = getMarksDb();
  if (!db) {
    return new Response("Favorites unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  await removeMark(db, email, event.params.slug, "favorite");
  return new Response(null, { status: 204 });
};
