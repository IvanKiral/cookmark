// @vitest-environment node
import type { APIEvent } from "@solidjs/start/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestD1, type TestD1 } from "~/lib/testD1.ts";
import { createSetRecipeFlagHandler, setRecipeFlag } from "./recipeFlagStore.ts";

const createDb = (): TestD1 => {
  const db = createTestD1([
    "recipes_schema.sql",
    "0002_users.sql",
    "0005_recipes_chef_pick.sql",
    "0006_recipes_should_delete.sql",
  ]);
  db.raw.exec(`INSERT INTO recipes (slug, data) VALUES ('soup', '{"title":"Soup"}')`);
  return db;
};

const readFlags = (db: TestD1, slug: string): unknown =>
  db.raw.prepare("SELECT is_chef_pick, should_delete FROM recipes WHERE slug = ?").get(slug);

describe("setRecipeFlag", () => {
  it("sets and clears each flag in its own column without touching the recipe data", async () => {
    const db = createDb();
    expect(readFlags(db, "soup")).toEqual({ is_chef_pick: 0, should_delete: 0 });

    expect(await setRecipeFlag(db, "soup", "chef-pick", true)).toBe(true);
    expect(readFlags(db, "soup")).toEqual({ is_chef_pick: 1, should_delete: 0 });

    expect(await setRecipeFlag(db, "soup", "should-delete", true)).toBe(true);
    expect(db.raw.prepare("SELECT data, is_chef_pick, should_delete FROM recipes").get()).toEqual({
      data: '{"title":"Soup"}',
      is_chef_pick: 1,
      should_delete: 1,
    });

    expect(await setRecipeFlag(db, "soup", "chef-pick", false)).toBe(true);
    expect(readFlags(db, "soup")).toEqual({ is_chef_pick: 0, should_delete: 1 });
  });

  it("reports an unknown recipe", async () => {
    expect(await setRecipeFlag(createDb(), "missing", "should-delete", true)).toBe(false);
  });
});

// Requests carry no Access token, so with DEV stubbed on the user is the dev email.
describe("recipe flag endpoint", () => {
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

  it("lets an admin set and clear a flag", async () => {
    const db = createDbWithRole("admin");
    expect(
      (await createSetRecipeFlagHandler("should-delete", true)(createEvent("soup"))).status,
    ).toBe(204);
    expect(readFlags(db, "soup")).toEqual({ is_chef_pick: 0, should_delete: 1 });
    expect(
      (await createSetRecipeFlagHandler("should-delete", false)(createEvent("soup"))).status,
    ).toBe(204);
    expect(readFlags(db, "soup")).toEqual({ is_chef_pick: 0, should_delete: 0 });
  });

  it("returns 404 for an unknown recipe", async () => {
    createDbWithRole("admin");
    expect(
      (await createSetRecipeFlagHandler("chef-pick", true)(createEvent("missing"))).status,
    ).toBe(404);
  });

  it.each(["chef-pick", "should-delete"] as const)("forbids viewers to change %s", async (flag) => {
    const db = createDbWithRole("viewer");
    expect((await createSetRecipeFlagHandler(flag, true)(createEvent("soup"))).status).toBe(403);
    expect(readFlags(db, "soup")).toEqual({ is_chef_pick: 0, should_delete: 0 });
  });

  it("rejects requests without an identity", async () => {
    createDbWithRole("admin");
    vi.stubEnv("DEV", false);
    expect((await createSetRecipeFlagHandler("chef-pick", true)(createEvent("soup"))).status).toBe(
      401,
    );
  });
});
