import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { D1Database } from "~/lib/userStore.ts";

// Test-only D1 stand-in backed by an in-memory SQLite database, so store
// functions run their real SQL against the real migration.
export const createTestD1 = (migrationFile: string): D1Database & { raw: DatabaseSync } => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(readFileSync(path.resolve(__dirname, "../../migrations", migrationFile), "utf8"));

  const prepare = (query: string, values: ReadonlyArray<unknown> = []) => ({
    bind: (...next: ReadonlyArray<unknown>) => prepare(query, next),
    run: async () => raw.prepare(query).run(...(values as SQLInputValue[])),
    first: async <T>() =>
      (raw.prepare(query).get(...(values as SQLInputValue[])) ?? null) as T | null,
  });

  return { prepare: (query: string) => prepare(query), raw };
};
