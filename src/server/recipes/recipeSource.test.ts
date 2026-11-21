// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { setTestEnv } from "~/server/testing/cloudflareWorkersStub.ts";
import { createTestD1, type TestD1 } from "~/server/testing/testD1.ts";
import { loadRecipeDataFromSource, loadRecipesFromSource } from "./recipeSource.ts";

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
    "0001_recipes.sql",
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
    setTestEnv({});
  });

  it("carries the verdict from the recipes table into the list", async () => {
    setTestEnv({ RECIPES: createDb() });
    const recipes = await loadRecipesFromSource();
    expect(recipes.map((recipe) => [recipe.url_slug, recipe.verdict])).toEqual([
      ["soup", "chef-kiss"],
      ["cake", undefined],
      ["stew", "chef-ok"],
    ]);
  });

  it("carries the verdict into a single recipe", async () => {
    setTestEnv({ RECIPES: createDb() });
    expect((await loadRecipeDataFromSource("soup"))?.verdict).toBe("chef-kiss");
    expect((await loadRecipeDataFromSource("cake"))?.verdict).toBeUndefined();
    expect((await loadRecipeDataFromSource("stew"))?.verdict).toBe("chef-ok");
  });

  it("carries should_delete into a single recipe", async () => {
    setTestEnv({ RECIPES: createDb() });
    expect((await loadRecipeDataFromSource("soup"))?.should_delete).toBe(false);
    expect((await loadRecipeDataFromSource("cake"))?.should_delete).toBe(true);
  });
});

describe("recipe source failures", () => {
  afterEach(() => {
    setTestEnv({});
    vi.restoreAllMocks();
  });

  it("logs a failed read and shows no recipes instead of throwing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    setTestEnv({ RECIPES: createTestD1([]) });
    expect(await loadRecipesFromSource()).toEqual([]);
    expect(await loadRecipeDataFromSource("soup")).toBeUndefined();
    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it("treats a missing database binding the same way", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    setTestEnv({});
    expect(await loadRecipesFromSource()).toEqual([]);
    expect(await loadRecipeDataFromSource("soup")).toBeUndefined();
  });
});
