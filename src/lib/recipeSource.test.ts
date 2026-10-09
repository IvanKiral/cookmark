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
  ]);
  db.raw
    .prepare("INSERT INTO recipes (slug, data, is_chef_pick, should_delete) VALUES (?, ?, ?, ?)")
    .run("soup", recipeJson("Soup"), 1, 0);
  db.raw
    .prepare("INSERT INTO recipes (slug, data, is_chef_pick, should_delete) VALUES (?, ?, ?, ?)")
    .run("cake", recipeJson("Cake"), 0, 1);
  return db;
};

describe("recipe source flags", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("carries is_chef_pick from the recipes table into the list", async () => {
    vi.stubGlobal("__env__", { RECIPES: createDb() });
    const recipes = await loadRecipesFromSource();
    expect(recipes.map((recipe) => [recipe.url_slug, recipe.is_chef_pick])).toEqual([
      ["soup", true],
      ["cake", false],
    ]);
  });

  it("carries is_chef_pick into a single recipe", async () => {
    vi.stubGlobal("__env__", { RECIPES: createDb() });
    expect((await loadRecipeDataFromSource("soup"))?.is_chef_pick).toBe(true);
    expect((await loadRecipeDataFromSource("cake"))?.is_chef_pick).toBe(false);
  });

  it("carries should_delete into a single recipe", async () => {
    vi.stubGlobal("__env__", { RECIPES: createDb() });
    expect((await loadRecipeDataFromSource("soup"))?.should_delete).toBe(false);
    expect((await loadRecipeDataFromSource("cake"))?.should_delete).toBe(true);
  });
});
