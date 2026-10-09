import type { APIEvent } from "@solidjs/start/server";
import { getUserEmail } from "~/lib/access.ts";
import { getMarksDb, readMarkedSlugs } from "~/lib/userMarksStore.ts";

export const GET = async (event: APIEvent): Promise<Response> => {
  const db = getMarksDb();
  if (!db) {
    return new Response("Favorites unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const slugs = await readMarkedSlugs(db, email, "favorite");
  return Response.json({ slugs });
};
