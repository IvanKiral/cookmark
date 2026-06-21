// Minimal KV shape (avoids depending on @cloudflare/workers-types). The Worker
// runtime provides the real binding via globalThis.__env__.
type KVNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

type FavoritesEnv = {
  FAVORITES?: KVNamespace;
};

export const getFavoritesKv = (): KVNamespace | undefined =>
  (globalThis as unknown as { __env__?: FavoritesEnv }).__env__?.FAVORITES;

const keyFor = (email: string): string => `favorites:${email}`;

export const readFavorites = async (
  kv: KVNamespace,
  email: string,
): Promise<ReadonlyArray<string>> => {
  const raw = await kv.get(keyFor(email));
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((slug): slug is string => typeof slug === "string")
      : [];
  } catch {
    return [];
  }
};

export const writeFavorites = async (
  kv: KVNamespace,
  email: string,
  slugs: ReadonlyArray<string>,
): Promise<void> => {
  await kv.put(keyFor(email), JSON.stringify(slugs));
};
