// @vitest-environment node
import type { APIEvent } from "@solidjs/start/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestD1, type TestD1 } from "~/lib/testD1.ts";
import { createSetChefPickHandler, setChefPick } from "./chefPickStore.ts";

const createDb = (): TestD1 => {
  const db = createTestD1(["recipes_schema.sql", "0002_users.sql", "0005_recipes_chef_pick.sql"]);
  db.raw.exec(`INSERT INTO recipes (slug, data) VALUES ('soup', '{"title":"Soup"}')`);
  return db;
};

const readFlag = (db: TestD1, slug: string): unknown =>
  db.raw.prepare("SELECT is_chef_pick FROM recipes WHERE slug = ?").get(slug);

describe("setChefPick", () => {
  it("sets and clears the flag without touching the recipe data", async () => {
    const db = createDb();
    expect(readFlag(db, "soup")).toEqual({ is_chef_pick: 0 });

    expect(await setChefPick(db, "soup", true)).toBe(true);
    expect(db.raw.prepare("SELECT data, is_chef_pick FROM recipes").get()).toEqual({
      data: '{"title":"Soup"}',
      is_chef_pick: 1,
    });

    expect(await setChefPick(db, "soup", false)).toBe(true);
    expect(readFlag(db, "soup")).toEqual({ is_chef_pick: 0 });
  });

  it("reports an unknown recipe", async () => {
    expect(await setChefPick(createDb(), "missing", true)).toBe(false);
  });
});

// Requests carry no Access token, so with DEV stubbed on the user is the dev email.
describe("chef pick endpoint", () => {
  const createEvent = (slug: string): APIEvent =>
    ({ request: new Request("http://localhost/"), params: { slug } }) as unknown as APIEvent;

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

  it("lets an admin set and clear the pick", async () => {
    const db = createDbWithRole("admin");
    expect((await createSetChefPickHandler(true)(createEvent("soup"))).status).toBe(204);
    expect(readFlag(db, "soup")).toEqual({ is_chef_pick: 1 });
    expect((await createSetChefPickHandler(false)(createEvent("soup"))).status).toBe(204);
    expect(readFlag(db, "soup")).toEqual({ is_chef_pick: 0 });
  });

  it("returns 404 for an unknown recipe", async () => {
    createDbWithRole("admin");
    expect((await createSetChefPickHandler(true)(createEvent("missing"))).status).toBe(404);
  });

  it("forbids viewers", async () => {
    const db = createDbWithRole("viewer");
    expect((await createSetChefPickHandler(true)(createEvent("soup"))).status).toBe(403);
    expect(readFlag(db, "soup")).toEqual({ is_chef_pick: 0 });
  });

  it("rejects requests without an identity", async () => {
    createDbWithRole("admin");
    vi.stubEnv("DEV", false);
    expect((await createSetChefPickHandler(true)(createEvent("soup"))).status).toBe(401);
  });
});
