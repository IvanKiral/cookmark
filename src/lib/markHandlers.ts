import type { APIEvent } from "@solidjs/start/server";
import type { Mark } from "~/constants/markOptions.ts";
import { getUserEmail } from "~/lib/access.ts";
import {
  addMark,
  type D1Database,
  getMarksDb,
  readMarkedSlugs,
  removeMark,
} from "~/lib/userMarksStore.ts";
import { getOrCreateUser } from "~/lib/userStore.ts";

type MarkRequest = {
  db: D1Database;
  email: string;
};

// Resolves the database and the signed-in user, or the error response to send.
const resolveRequest = async (event: APIEvent): Promise<MarkRequest | Response> => {
  const db = getMarksDb();
  if (!db) {
    return new Response("Recipe marks unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  return { db, email };
};

export const createReadMarksHandler =
  (mark: Mark) =>
  async (event: APIEvent): Promise<Response> => {
    const request = await resolveRequest(event);
    if (request instanceof Response) {
      return request;
    }
    const slugs = await readMarkedSlugs(request.db, request.email, mark);
    return Response.json({ slugs });
  };

export const createAddMarkHandler =
  (mark: Mark) =>
  async (event: APIEvent): Promise<Response> => {
    const request = await resolveRequest(event);
    if (request instanceof Response) {
      return request;
    }
    const now = new Date().toISOString();
    await getOrCreateUser(request.db, request.email, now);
    await addMark(request.db, request.email, event.params.slug, mark, now);
    return new Response(null, { status: 204 });
  };

export const createRemoveMarkHandler =
  (mark: Mark) =>
  async (event: APIEvent): Promise<Response> => {
    const request = await resolveRequest(event);
    if (request instanceof Response) {
      return request;
    }
    await removeMark(request.db, request.email, event.params.slug, mark);
    return new Response(null, { status: 204 });
  };
