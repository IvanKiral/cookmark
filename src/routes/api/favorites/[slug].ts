import type { APIEvent } from "@solidjs/start/server";
import { getUserEmail } from "~/lib/access.ts";
import { getFavoritesKv, readFavorites, writeFavorites } from "~/lib/favoritesStore.ts";

export const PUT = async (event: APIEvent): Promise<Response> => {
  const kv = getFavoritesKv();
  if (!kv) {
    return new Response("Favorites unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const slug = event.params.slug;
  const current = await readFavorites(kv, email);
  if (!current.includes(slug)) {
    await writeFavorites(kv, email, [...current, slug]);
  }
  return new Response(null, { status: 204 });
};

export const DELETE = async (event: APIEvent): Promise<Response> => {
  const kv = getFavoritesKv();
  if (!kv) {
    return new Response("Favorites unavailable", { status: 500 });
  }
  const email = await getUserEmail(event.request);
  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const slug = event.params.slug;
  const current = await readFavorites(kv, email);
  if (current.includes(slug)) {
    await writeFavorites(
      kv,
      email,
      current.filter((entry) => entry !== slug),
    );
  }
  return new Response(null, { status: 204 });
};
