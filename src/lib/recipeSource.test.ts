// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestD1, type TestD1 } from "~/lib/testD1.ts";

// Normally injected at build time by app.config.ts; loadRecipes reads it on import.
vi.hoisted(() => {
  (globalThis as unknown as { __VIDEO_SLUGS__: ReadonlyArray<string> }).__VIDEO_SLUGS__ = [];
});

const { loadRecipeDataFromSource, loadRecipesFromSource } = await import("./recipeSource.ts");

const recipeJson = (title: string): string =>
  JSON.stringify({
    title,
    description: "",
    prep_time: null,
    cook_time: null,
    total_time: 20,
    servings: 2,
    ingredients: [],
    instructions: [],
    tags: [],
    difficulty: "easy",
    cuisine: null,
  });

const createDb = (): TestD1 => {
  const db = createTestD1([
    "recipes_schema.sql",
    "0005_recipes_chef_pick.sql",
    "0006_recipes_should_delete.sql",
    "0008_recipes_verdict.sql",
  ]);
  const insert = db.raw.prepare(
    "INSERT INTO recipes (slug, data, verdict, should_delete) VALUES (?, ?, ?, ?)",
  );
  insert.run("soup", recipeJson("Soup"), "chef-kiss", 0);
  insert.run("cake", recipeJson("Cake"), null, 1);
  insert.run("stew", recipeJson("Stew"), "chef-ok", 0);
  return db;
};

describe("recipe source flags", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("carries the verdict from the recipes table into the list", async () => {
    vi.stubGlobal("__env__", { RECIPES: createDb() });
    const recipes = await loadRecipesFromSource();
    expect(recipes.map((recipe) => [recipe.url_slug, recipe.verdict])).toEqual([
      ["soup", "chef-kiss"],
      ["cake", undefined],
      ["stew", "chef-ok"],
    ]);
  });

  it("carries the verdict into a single recipe", async () => {
    vi.stubGlobal("__env__", { RECIPES: createDb() });
    expect((await loadRecipeDataFromSource("soup"))?.verdict).toBe("chef-kiss");
    expect((await loadRecipeDataFromSource("cake"))?.verdict).toBeUndefined();
    expect((await loadRecipeDataFromSource("stew"))?.verdict).toBe("chef-ok");
  });

  it("carries should_delete into a single recipe", async () => {
    vi.stubGlobal("__env__", { RECIPES: createDb() });
    expect((await loadRecipeDataFromSource("soup"))?.should_delete).toBe(false);
    expect((await loadRecipeDataFromSource("cake"))?.should_delete).toBe(true);
  });
});
