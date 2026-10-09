// @vitest-environment node
import type { APIEvent } from "@solidjs/start/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestD1, type TestD1 } from "~/lib/testD1.ts";
import type { RecipeEdit } from "~/utils/recipeEdit.ts";
import { handleUpdateRecipe, updateRecipe } from "./recipeEditStore.ts";

const originalData = JSON.stringify({
  title: "Soup",
  description: "",
  prep_time: 5,
  cook_time: 10,
  total_time: 15,
  servings: 2,
  ingredients: [{ name: "Water", amount: "1", unit: "l" }],
  instructions: [{ name: "Main", steps: ["Boil"] }],
  tags: ["Soup"],
  difficulty: "easy",
  cuisine: null,
  source_url: "https://example.com/soup",
});

const edit: RecipeEdit = {
  title: "Better soup",
  description: "Now with salt",
  prep_time: 5,
  cook_time: 20,
  total_time: 25,
  tags: ["Soup", "Vegan"],
  ingredients: [{ name: "Water", amount: 1.5, unit: "l" }],
  instructions: [{ name: "Main", steps: ["Boil well"] }],
};

const createDb = (): TestD1 => {
  const db = createTestD1([
    "recipes_schema.sql",
    "0002_users.sql",
    "0005_recipes_chef_pick.sql",
    "0006_recipes_should_delete.sql",
    "0007_recipe_revisions.sql",
  ]);
  db.raw
    .prepare("INSERT INTO recipes (slug, data, is_chef_pick, should_delete) VALUES (?, ?, 1, 1)")
    .run("soup", originalData);
  return db;
};

const readRecipe = (db: TestD1) =>
  db.raw
    .prepare("SELECT data, is_chef_pick, should_delete FROM recipes WHERE slug = 'soup'")
    .get() as {
    data: string;
    is_chef_pick: number;
    should_delete: number;
  };

const readRevisions = (db: TestD1): ReadonlyArray<unknown> =>
  db.raw.prepare("SELECT slug, data, edited_by, edited_at FROM recipe_revisions").all();

describe("updateRecipe", () => {
  it("writes the edit, keeps the flags and other fields, and saves the old data", async () => {
    const db = createDb();
    expect(await updateRecipe(db, "soup", edit, "admin@example.com", "2026-10-09T12:00:00Z")).toBe(
      true,
    );

    const row = readRecipe(db);
    expect(JSON.parse(row.data)).toEqual({ ...JSON.parse(originalData), ...edit });
    expect([row.is_chef_pick, row.should_delete]).toEqual([1, 1]);
    expect(readRevisions(db)).toEqual([
      {
        slug: "soup",
        data: originalData,
        edited_by: "admin@example.com",
        edited_at: "2026-10-09T12:00:00Z",
      },
    ]);
  });

  it("reports an unknown recipe and writes nothing", async () => {
    const db = createDb();
    expect(await updateRecipe(db, "missing", edit, "admin@example.com", "x")).toBe(false);
    expect(readRevisions(db)).toEqual([]);
  });
});

// Requests carry no Access token, so with DEV stubbed on the user is the dev email.
describe("recipe edit endpoint", () => {
  const createEvent = (slug: string, body: string): APIEvent =>
    ({
      request: new Request("http://localhost/", { method: "PUT", body }),
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

  it("lets an admin save an edit and records who made it", async () => {
    const db = createDbWithRole("admin");
    const response = await handleUpdateRecipe(createEvent("soup", JSON.stringify(edit)));
    expect(response.status).toBe(204);
    expect(JSON.parse(readRecipe(db).data).title).toBe("Better soup");
    expect(readRevisions(db)).toEqual([expect.objectContaining({ edited_by: "dev@localhost" })]);
  });

  it("returns field errors for an invalid edit", async () => {
    const db = createDbWithRole("admin");
    const response = await handleUpdateRecipe(
      createEvent("soup", JSON.stringify({ ...edit, title: "" })),
    );
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ errors: { title: "Enter a name." } });
    expect(readRevisions(db)).toEqual([]);
  });

  it("rejects malformed JSON", async () => {
    createDbWithRole("admin");
    expect((await handleUpdateRecipe(createEvent("soup", "{"))).status).toBe(400);
  });

  it("returns 404 for an unknown recipe", async () => {
    createDbWithRole("admin");
    expect((await handleUpdateRecipe(createEvent("missing", JSON.stringify(edit)))).status).toBe(
      404,
    );
  });

  it("forbids viewers", async () => {
    const db = createDbWithRole("viewer");
    expect((await handleUpdateRecipe(createEvent("soup", JSON.stringify(edit)))).status).toBe(403);
    expect(readRecipe(db).data).toBe(originalData);
  });

  it("rejects requests without an identity", async () => {
    createDbWithRole("admin");
    vi.stubEnv("DEV", false);
    expect((await handleUpdateRecipe(createEvent("soup", JSON.stringify(edit)))).status).toBe(401);
  });
});
