// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { APIEvent } from "~/server/apiEvent.ts";
import { setTestEnv } from "~/server/testing/cloudflareWorkersStub.ts";
import { createTestD1, listMigrations, type TestD1 } from "~/server/testing/testD1.ts";
import type { Collection, SmartFilters } from "~/shared/collections.ts";
import {
  handleAddCollectionRecipes,
  handleCreateCollection,
  handleDeleteCollection,
  handleReadCollections,
  handleRemoveCollectionRecipes,
  handleReorderCollectionRecipes,
  handleUpdateCollection,
} from "./collectionHandlers.ts";

// Requests carry no Access token, so the user is LOCAL_USER_EMAIL.
const ANA = "ana@localhost";
const BOB = "bob@localhost";

const createEvent = (body?: unknown, id?: string): APIEvent => ({
  request: new Request("http://localhost/api/collections", {
    method: "POST",
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  }),
  params: id === undefined ? {} : { id },
});

const soupFilters: SmartFilters = {
  difficulty: [],
  time: [],
  tag: ["Soup"],
  author: [],
  recommended: [],
};

const readError = async (response: Response): Promise<unknown> =>
  ((await response.json()) as { error: unknown }).error;

const readCollectionsAs = async (): Promise<ReadonlyArray<Collection>> => {
  const response = await handleReadCollections(createEvent());
  return ((await response.json()) as { collections: ReadonlyArray<Collection> }).collections;
};

const createAs = async (body: unknown): Promise<Collection> => {
  const response = await handleCreateCollection(createEvent(body));
  expect(response.status).toBe(201);
  return ((await response.json()) as { collection: Collection }).collection;
};

describe("collection handlers", () => {
  let db: TestD1;

  const signInAs = (email: string): void => {
    setTestEnv({ RECIPES: db, LOCAL_USER_EMAIL: email });
  };

  beforeEach(() => {
    db = createTestD1(listMigrations());
    signInAs(ANA);
  });

  afterEach(() => {
    setTestEnv({});
  });

  describe("access", () => {
    it("returns 401 without an identity", async () => {
      setTestEnv({ RECIPES: db });
      expect((await handleReadCollections(createEvent())).status).toBe(401);
      expect(
        (await handleCreateCollection(createEvent({ name: "A", kind: "manual" }))).status,
      ).toBe(401);
    });

    it("returns 500 when the database binding is missing", async () => {
      setTestEnv({ LOCAL_USER_EMAIL: ANA });
      const response = await handleReadCollections(createEvent());
      expect(response.status).toBe(500);
      expect(await response.text()).toBe("Collections unavailable");
    });

    it("answers 404 for another user's collection on every route", async () => {
      const collection = await createAs({ name: "Soups", kind: "manual", slugs: ["a"] });
      signInAs(BOB);
      const id = collection.id;
      const responses = await Promise.all([
        handleUpdateCollection(createEvent({ name: "X", filters: null, isPinned: false }, id)),
        handleDeleteCollection(createEvent(undefined, id)),
        handleAddCollectionRecipes(createEvent({ slugs: ["b"] }, id)),
        handleRemoveCollectionRecipes(createEvent({ slugs: ["a"] }, id)),
        handleReorderCollectionRecipes(createEvent({ slugs: ["a"] }, id)),
      ]);
      expect(responses.map((response) => response.status)).toEqual([404, 404, 404, 404, 404]);
      expect(await readCollectionsAs()).toEqual([]);
      signInAs(ANA);
      expect(await readCollectionsAs()).toEqual([collection]);
    });
  });

  describe("GET /api/collections", () => {
    it("lists collections by name with slugs in order", async () => {
      await createAs({ name: "zesty", kind: "manual", slugs: ["b", "a"] });
      await createAs({ name: "Apple", kind: "smart", filters: soupFilters });
      const collections = await readCollectionsAs();
      expect(collections.map((collection) => [collection.name, collection.slugs])).toEqual([
        ["Apple", []],
        ["zesty", ["b", "a"]],
      ]);
    });
  });

  describe("POST /api/collections", () => {
    it("creates the user on first write and returns 201 with the collection", async () => {
      const collection = await createAs({ name: "  Soups  ", kind: "manual", isPinned: true });
      expect(collection).toMatchObject({ name: "Soups", kind: "manual", pinPosition: 1 });
      expect(db.raw.prepare("SELECT email FROM users").all()).toEqual([{ email: ANA }]);
    });

    it("drops unknown filter values of a smart filter", async () => {
      const collection = await createAs({
        name: "Soups",
        kind: "smart",
        filters: { ...soupFilters, tag: ["Soup", "Unknown"], mark: ["favorite"] },
      });
      expect(collection.filters).toEqual(soupFilters);
    });

    it.each([
      ["not json", "{", "invalid-body"],
      ["a list", [], "invalid-body"],
      ["a missing name", { kind: "manual" }, "invalid-body"],
      ["an unknown kind", { name: "A", kind: "folder" }, "invalid-body"],
      ["a non-boolean pin", { name: "A", kind: "manual", isPinned: "yes" }, "invalid-body"],
      ["non-string slugs", { name: "A", kind: "manual", slugs: [1] }, "invalid-body"],
      ["an empty name", { name: "   ", kind: "manual" }, "name-empty"],
      ["a long name", { name: "x".repeat(61), kind: "manual" }, "name-too-long"],
      [
        "filters on manual",
        { name: "A", kind: "manual", filters: soupFilters },
        "filters-on-manual",
      ],
      [
        "slugs on smart",
        { name: "A", kind: "smart", filters: soupFilters, slugs: ["a"] },
        "slugs-on-smart",
      ],
      ["smart without filters", { name: "A", kind: "smart" }, "filters-invalid"],
      ["smart with a string", { name: "A", kind: "smart", filters: "Soup" }, "filters-invalid"],
      [
        "smart with only unknown values",
        { name: "A", kind: "smart", filters: { tag: ["Gone"] } },
        "filters-invalid",
      ],
    ])("answers 400 for %s", async (_, body, error) => {
      const response = await handleCreateCollection(createEvent(body));
      expect(response.status).toBe(400);
      expect(await readError(response)).toBe(error);
    });

    it("accepts a name of 60 characters", async () => {
      await createAs({ name: "x".repeat(60), kind: "manual" });
    });

    it("answers 409 name-taken and pins-full", async () => {
      await createAs({ name: "Soups", kind: "manual", isPinned: true });
      await createAs({ name: "Cakes", kind: "manual", isPinned: true });
      await createAs({ name: "Pies", kind: "manual", isPinned: true });

      const taken = await handleCreateCollection(createEvent({ name: "SOUPS", kind: "manual" }));
      expect(taken.status).toBe(409);
      expect(await readError(taken)).toBe("name-taken");

      const full = await handleCreateCollection(
        createEvent({ name: "Stews", kind: "manual", isPinned: true }),
      );
      expect(full.status).toBe(409);
      expect(await readError(full)).toBe("pins-full");
    });
  });

  describe("PUT /api/collections/:id", () => {
    it("renames and pins", async () => {
      const collection = await createAs({ name: "Soups", kind: "manual" });
      const response = await handleUpdateCollection(
        createEvent({ name: "Stews", filters: null, isPinned: true }, collection.id),
      );
      expect(response.status).toBe(200);
      expect(((await response.json()) as { collection: Collection }).collection).toEqual({
        ...collection,
        name: "Stews",
        pinPosition: 1,
      });
    });

    it("updates smart filters, and keeps them when sent as null", async () => {
      const collection = await createAs({ name: "Soups", kind: "smart", filters: soupFilters });
      const dinner = { ...soupFilters, tag: ["Dinner"] };
      await handleUpdateCollection(
        createEvent({ name: "Soups", filters: dinner, isPinned: false }, collection.id),
      );
      await handleUpdateCollection(
        createEvent({ name: "Dinners", filters: null, isPinned: false }, collection.id),
      );
      const [read] = await readCollectionsAs();
      expect(read).toMatchObject({ name: "Dinners", filters: dinner });
    });

    it.each([
      ["a missing pin flag", { name: "A", filters: null }, "invalid-body"],
      ["missing filters", { name: "A", isPinned: false }, "invalid-body"],
      ["an empty name", { name: "", filters: null, isPinned: false }, "name-empty"],
      ["a long name", { name: "x".repeat(61), filters: null, isPinned: false }, "name-too-long"],
      [
        "filters on manual",
        { name: "A", filters: soupFilters, isPinned: false },
        "filters-on-manual",
      ],
    ])("answers 400 for %s", async (_, body, error) => {
      const collection = await createAs({ name: "Soups", kind: "manual" });
      const response = await handleUpdateCollection(createEvent(body, collection.id));
      expect(response.status).toBe(400);
      expect(await readError(response)).toBe(error);
    });

    it("answers filters-invalid for empty smart filters", async () => {
      const collection = await createAs({ name: "Soups", kind: "smart", filters: soupFilters });
      const response = await handleUpdateCollection(
        createEvent({ name: "Soups", filters: { tag: [] }, isPinned: false }, collection.id),
      );
      expect(response.status).toBe(400);
      expect(await readError(response)).toBe("filters-invalid");
    });

    it("answers 409 name-taken and pins-full", async () => {
      await createAs({ name: "A", kind: "manual", isPinned: true });
      await createAs({ name: "B", kind: "manual", isPinned: true });
      await createAs({ name: "C", kind: "manual", isPinned: true });
      const collection = await createAs({ name: "D", kind: "manual" });
      const taken = await handleUpdateCollection(
        createEvent({ name: "a", filters: null, isPinned: false }, collection.id),
      );
      expect(taken.status).toBe(409);
      expect(await readError(taken)).toBe("name-taken");
      const full = await handleUpdateCollection(
        createEvent({ name: "D", filters: null, isPinned: true }, collection.id),
      );
      expect(full.status).toBe(409);
      expect(await readError(full)).toBe("pins-full");
    });

    it("answers 404 for an unknown id", async () => {
      const response = await handleUpdateCollection(
        createEvent({ name: "A", filters: null, isPinned: false }, "missing"),
      );
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/collections/:id", () => {
    it("deletes the collection and its recipes, then answers 404", async () => {
      const collection = await createAs({ name: "Soups", kind: "manual", slugs: ["a"] });
      expect((await handleDeleteCollection(createEvent(undefined, collection.id))).status).toBe(
        204,
      );
      expect(await readCollectionsAs()).toEqual([]);
      expect(db.raw.prepare("SELECT * FROM user_collection_recipes").all()).toEqual([]);
      expect((await handleDeleteCollection(createEvent(undefined, collection.id))).status).toBe(
        404,
      );
    });
  });

  describe("recipes of a collection", () => {
    it("appends, skipping duplicates and slugs already present, and removes", async () => {
      const collection = await createAs({ name: "Soups", kind: "manual", slugs: ["a"] });
      const id = collection.id;
      expect(
        (await handleAddCollectionRecipes(createEvent({ slugs: ["b", "a", "b", "c"] }, id))).status,
      ).toBe(204);
      expect((await handleAddCollectionRecipes(createEvent({ slugs: [] }, id))).status).toBe(204);
      expect((await readCollectionsAs())[0]?.slugs).toEqual(["a", "b", "c"]);

      expect(
        (await handleRemoveCollectionRecipes(createEvent({ slugs: ["b", "missing"] }, id))).status,
      ).toBe(204);
      expect((await readCollectionsAs())[0]?.slugs).toEqual(["a", "c"]);
    });

    it("answers not-manual for smart filters and invalid-body for bad slugs", async () => {
      const smart = await createAs({ name: "Soups", kind: "smart", filters: soupFilters });
      const notManual = await handleAddCollectionRecipes(createEvent({ slugs: ["a"] }, smart.id));
      expect(notManual.status).toBe(400);
      expect(await readError(notManual)).toBe("not-manual");

      const removeNotManual = await handleRemoveCollectionRecipes(
        createEvent({ slugs: ["a"] }, smart.id),
      );
      expect(await readError(removeNotManual)).toBe("not-manual");

      const invalid = await handleAddCollectionRecipes(createEvent({ slugs: "a" }, smart.id));
      expect(invalid.status).toBe(400);
      expect(await readError(invalid)).toBe("invalid-body");
    });
  });

  describe("PUT /api/collections/:id/order", () => {
    it("reorders, and answers order-mismatch for anything but the stored set", async () => {
      const collection = await createAs({ name: "Soups", kind: "manual", slugs: ["a", "b", "c"] });
      const id = collection.id;
      expect(
        (await handleReorderCollectionRecipes(createEvent({ slugs: ["c", "a", "b"] }, id))).status,
      ).toBe(204);
      expect((await readCollectionsAs())[0]?.slugs).toEqual(["c", "a", "b"]);

      const mismatch = await handleReorderCollectionRecipes(createEvent({ slugs: ["c", "a"] }, id));
      expect(mismatch.status).toBe(400);
      expect(await readError(mismatch)).toBe("order-mismatch");
      expect((await readCollectionsAs())[0]?.slugs).toEqual(["c", "a", "b"]);
    });

    it("answers not-manual for a smart filter", async () => {
      const smart = await createAs({ name: "Soups", kind: "smart", filters: soupFilters });
      const response = await handleReorderCollectionRecipes(createEvent({ slugs: [] }, smart.id));
      expect(await readError(response)).toBe("not-manual");
    });
  });
});
