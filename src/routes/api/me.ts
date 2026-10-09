import type { APIEvent } from "@solidjs/start/server";
import { getUserEmail } from "~/lib/access.ts";
import { getOrCreateUser, getUsersDb } from "~/lib/userStore.ts";

export const GET = async (event: APIEvent): Promise<Response> => {
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const db = getUsersDb();
  if (!db) {
    return new Response("Users unavailable", { status: 500 });
  }
  return Response.json(await getOrCreateUser(db, email, new Date().toISOString()));
};
