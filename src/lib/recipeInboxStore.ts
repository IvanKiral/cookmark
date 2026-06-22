type D1RunResult = {
  meta: { changes: number };
};

type D1PreparedStatement = {
  bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement;
  run: () => Promise<D1RunResult>;
  all: <T>() => Promise<{ results: ReadonlyArray<T> }>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type RecipeInboxEnv = {
  RECIPE_INBOX?: D1Database;
};

export type RecipeInboxRow = {
  id: number;
  url: string;
  status: string;
  created_at: string;
};

export type InsertOutcome = "added" | "duplicate";

const TRACKING_PARAM_KEYS = new Set(["fbclid", "gclid", "mc_eid", "mc_cid"]);

export const getRecipeInboxDb = (): D1Database | undefined =>
  (globalThis as unknown as { __env__?: RecipeInboxEnv }).__env__?.RECIPE_INBOX;

export const normalizeUrl = (raw: string): string | undefined => {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    url.hostname = url.hostname.toLowerCase();
    url.hash = "";
    const dropKeys = [...url.searchParams.keys()].filter(
      (key) => key.toLowerCase().startsWith("utm_") || TRACKING_PARAM_KEYS.has(key.toLowerCase()),
    );
    for (const key of dropKeys) {
      url.searchParams.delete(key);
    }
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString();
  } catch {
    return undefined;
  }
};

export const insertLink = async (
  db: D1Database,
  url: string,
  createdAt: string,
): Promise<InsertOutcome> => {
  const result = await db
    .prepare("INSERT OR IGNORE INTO recipe_inbox (url, created_at) VALUES (?, ?)")
    .bind(url, createdAt)
    .run();
  return result.meta.changes > 0 ? "added" : "duplicate";
};

export const readPending = async (db: D1Database): Promise<ReadonlyArray<RecipeInboxRow>> => {
  const result = await db
    .prepare(
      "SELECT id, url, status, created_at FROM recipe_inbox WHERE status = 'pending' ORDER BY created_at ASC",
    )
    .all<RecipeInboxRow>();
  return result.results;
};

export const markProcessed = async (
  db: D1Database,
  id: number,
  status: "done" | "failed",
): Promise<boolean> => {
  const result = await db
    .prepare("UPDATE recipe_inbox SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
  return result.meta.changes > 0;
};
