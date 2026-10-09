import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

type TestD1Statement = {
  bind: (...values: ReadonlyArray<unknown>) => TestD1Statement;
  run: () => Promise<{ meta: { changes: number } }>;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<{ results: ReadonlyArray<T> }>;
};

export type TestD1 = {
  prepare: (query: string) => TestD1Statement;
  batch: (
    statements: ReadonlyArray<{ run: () => Promise<unknown> }>,
  ) => Promise<ReadonlyArray<unknown>>;
  raw: DatabaseSync;
};

export const readMigration = (file: string): string =>
  readFileSync(path.resolve(__dirname, "../../migrations", file), "utf8");

// Test-only D1 stand-in backed by an in-memory SQLite database, so store
// functions run their real SQL against the real migrations (applied in order).
export const createTestD1 = (migrationFiles: ReadonlyArray<string>): TestD1 => {
  const raw = new DatabaseSync(":memory:");
  for (const file of migrationFiles) {
    raw.exec(readMigration(file));
  }

  const prepare = (query: string, values: ReadonlyArray<unknown> = []): TestD1Statement => ({
    bind: (...next: ReadonlyArray<unknown>) => prepare(query, next),
    run: async () => ({
      meta: { changes: Number(raw.prepare(query).run(...(values as SQLInputValue[])).changes) },
    }),
    first: async <T>() =>
      (raw.prepare(query).get(...(values as SQLInputValue[])) ?? null) as T | null,
    all: async <T>() => ({
      results: raw
        .prepare(query)
        .all(...(values as SQLInputValue[])) as unknown as ReadonlyArray<T>,
    }),
  });

  // Like D1, a batch runs as one transaction: any failure rolls back every statement.
  const batch = async (statements: ReadonlyArray<{ run: () => Promise<unknown> }>) => {
    raw.exec("BEGIN");
    try {
      const results: unknown[] = [];
      for (const statement of statements) {
        results.push(await statement.run());
      }
      raw.exec("COMMIT");
      return results;
    } catch (error) {
      raw.exec("ROLLBACK");
      throw error;
    }
  };

  return { prepare: (query: string) => prepare(query), batch, raw };
};
