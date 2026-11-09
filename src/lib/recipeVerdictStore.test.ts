// @vitest-environment node
import type { APIEvent } from "@solidjs/start/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recipeVerdictValues } from "~/constants/recipeVerdicts.ts";
import { createTestD1, readMigration, type TestD1 } from "~/lib/testD1.ts";
import {
  handleClearRecipeVerdict,
  handleSetRecipeVerdict,
  setRecipeVerdict,
} from "./recipeVerdictStore.ts";

const createDb = (): TestD1 => {
  const db = createTestD1([
    "recipes_schema.sql",
    "0002_users.sql",
    "0005_recipes_chef_pick.sql",
    "0006_recipes_should_delete.sql",
    "0008_recipes_verdict.sql",
  ]);
  db.raw.exec(`INSERT INTO recipes (slug, data) VALUES ('soup', '{"title":"Soup"}')`);
  return db;
};

const readVerdict = (db: TestD1, slug: string): unknown =>
  db.raw.prepare("SELECT verdict FROM recipes WHERE slug = ?").get(slug);

describe("0008_recipes_verdict migration", () => {
  it("turns existing Chef's picks into the chef-kiss verdict", () => {
    const db = createTestD1([
      "recipes_schema.sql",
      "0005_recipes_chef_pick.sql",
      "0006_recipes_should_delete.sql",
    ]);
    db.raw.exec(`
      INSERT INTO recipes (slug, data, is_chef_pick) VALUES ('soup', '{}', 1);
      INSERT INTO recipes (slug, data, is_chef_pick) VALUES ('cake', '{}', 0);
    `);
    db.raw.exec(readMigration("0008_recipes_verdict.sql"));
    expect(db.raw.prepare("SELECT slug, verdict FROM recipes ORDER BY slug").all()).toEqual([
      { slug: "cake", verdict: null },
      { slug: "soup", verdict: "chef-kiss" },
    ]);
  });

  it.each(recipeVerdictValues)("accepts the %s verdict", (verdict) => {
    const db = createDb();
    db.raw.prepare("UPDATE recipes SET verdict = ?").run(verdict);
    expect(readVerdict(db, "soup")).toEqual({ verdict });
  });

  it.each(["yummy", "chef-pick", "chef-tested"])("rejects the unknown %s verdict", (verdict) => {
    const db = createDb();
    expect(() => db.raw.prepare("UPDATE recipes SET verdict = ?").run(verdict)).toThrow();
  });
});

describe("setRecipeVerdict", () => {
  it("sets, replaces and clears the verdict without touching the recipe data", async () => {
    const db = createDb();
    expect(readVerdict(db, "soup")).toEqual({ verdict: null });

    expect(await setRecipeVerdict(db, "soup", "chef-ok")).toBe(true);
    expect(readVerdict(db, "soup")).toEqual({ verdict: "chef-ok" });

    expect(await setRecipeVerdict(db, "soup", "chef-kiss")).toBe(true);
    expect(db.raw.prepare("SELECT data, verdict FROM recipes").get()).toEqual({
      data: '{"title":"Soup"}',
      verdict: "chef-kiss",
    });

    expect(await setRecipeVerdict(db, "soup", null)).toBe(true);
    expect(readVerdict(db, "soup")).toEqual({ verdict: null });
  });

  it("reports an unknown recipe", async () => {
    expect(await setRecipeVerdict(createDb(), "missing", "chef-kiss")).toBe(false);
  });
});

// Requests carry no Access token, so with DEV stubbed on the user is the dev email.
describe("recipe verdict endpoint", () => {
  const createEvent = (slug: string, body?: unknown): APIEvent =>
    ({
      request: new Request("http://localhost/", {
        method: body === undefined ? "DELETE" : "PUT",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      params: { slug },
    }) as unknown as APIEvent;

  const createDbWithRole = (role: "admin" | "viewer"): TestD1 => {
    const db = createDb();
    db.raw.exec(
      `INSERT INTO users (email, role, created_at) VALUES ('dev@localhost', '${role}', 'x')`,
    );
    vi.stubGlobal("__env__", { RECIPES: db });
    return db;
  };

  beforeEach(() => {
    vi.stubEnv("DEV", true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("lets an admin set and clear a verdict", async () => {
    const db = createDbWithRole("admin");
    expect((await handleSetRecipeVerdict(createEvent("soup", { verdict: "chef-ok" }))).status).toBe(
      204,
    );
    expect(readVerdict(db, "soup")).toEqual({ verdict: "chef-ok" });
    expect((await handleClearRecipeVerdict(createEvent("soup"))).status).toBe(204);
    expect(readVerdict(db, "soup")).toEqual({ verdict: null });
  });

  it.each([{ verdict: "yummy" }, {}, null, "chef-kiss"])(
    "rejects an invalid body (%j)",
    async (body) => {
      const db = createDbWithRole("admin");
      expect((await handleSetRecipeVerdict(createEvent("soup", body))).status).toBe(400);
      expect(readVerdict(db, "soup")).toEqual({ verdict: null });
    },
  );

  it("returns 404 for an unknown recipe", async () => {
    createDbWithRole("admin");
    expect(
      (await handleSetRecipeVerdict(createEvent("missing", { verdict: "chef-kiss" }))).status,
    ).toBe(404);
  });

  it("forbids viewers to change the verdict", async () => {
    const db = createDbWithRole("viewer");
    expect(
      (await handleSetRecipeVerdict(createEvent("soup", { verdict: "chef-kiss" }))).status,
    ).toBe(403);
    expect(readVerdict(db, "soup")).toEqual({ verdict: null });
  });

  it("rejects requests without an identity", async () => {
    createDbWithRole("admin");
    vi.stubEnv("DEV", false);
    expect((await handleClearRecipeVerdict(createEvent("soup"))).status).toBe(401);
  });
});
