import type { APIEvent } from "@solidjs/start/server";
import { getUserEmail } from "~/lib/access.ts";
import { getFavoritesKv, readFavorites } from "~/lib/favoritesStore.ts";

export const GET = async (event: APIEvent): Promise<Response> => {
  const kv = getFavoritesKv();
  if (!kv) {
    return new Response("Favorites unavailable", { status: 500 });
  }
  const slugs = await readFavorites(kv, getUserEmail(event.request));
  return Response.json({ slugs });
};
