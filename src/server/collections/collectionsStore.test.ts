// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getOrCreateUser } from "~/server/auth/userStore.ts";
import { createTestD1, listMigrations, type TestD1 } from "~/server/testing/testD1.ts";
import type { Collection, SmartFilters } from "~/shared/collections.ts";
import {
  appendRecipes,
  type CollectionWriteResult,
  createCollection,
  deleteCollection,
  type NewCollection,
  readCollection,
  readCollections,
  removeRecipes,
  reorderRecipes,
  updateCollection,
} from "./collectionsStore.ts";

const NOW = "2026-11-23T10:00:00.000Z";
const ANA = "ana@example.com";
const BOB = "bob@example.com";

const createDb = async (): Promise<TestD1> => {
  const db = createTestD1(listMigrations());
  await getOrCreateUser(db, ANA, NOW);
  await getOrCreateUser(db, BOB, NOW);
  return db;
};

const manual = (name: string, overrides: Partial<NewCollection> = {}): NewCollection => ({
  name,
  kind: "manual",
  filters: null,
  isPinned: false,
  slugs: [],
  ...overrides,
});

const soupFilters: SmartFilters = {
  difficulty: [],
  time: ["under30"],
  tag: ["Soup"],
  author: [],
  recommended: [],
};

const expectSaved = (result: CollectionWriteResult | undefined): Collection => {
  if (!result?.isSaved) {
    throw new Error(`Expected a saved collection, got ${JSON.stringify(result)}`);
  }
  return result.collection;
};

const create = async (
  db: TestD1,
  collection: NewCollection,
  email: string = ANA,
): Promise<Collection> => expectSaved(await createCollection(db, email, collection, NOW));

describe("0009 migration", () => {
  it("rejects unknown kinds and pin positions outside 1 to 3", async () => {
    const db = await createDb();
    const insert = (kind: string, pin: number | null) =>
      db.raw
        .prepare(
          "INSERT INTO user_collections (id, email, name, kind, pin_position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .run(crypto.randomUUID(), ANA, crypto.randomUUID(), kind, pin, NOW, NOW);
    expect(() => insert("folder", null)).toThrow(/CHECK/);
    expect(() => insert("manual", 4)).toThrow(/CHECK/);
    expect(() => insert("manual", 0)).toThrow(/CHECK/);
    expect(() => insert("manual", 3)).not.toThrow();
  });

  it("requires an existing user", async () => {
    const db = await createDb();
    await expect(createCollection(db, "ghost@example.com", manual("Soups"), NOW)).rejects.toThrow(
      /FOREIGN KEY/,
    );
  });
});

describe("createCollection", () => {
  it("creates a manual collection with recipes in the given order, skipping duplicates", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["leek", "pea", "leek"] }));
    expect(collection).toEqual({
      id: expect.any(String),
      name: "Soups",
      kind: "manual",
      filters: null,
      pinPosition: null,
      slugs: ["leek", "pea"],
    });
    expect(
      db.raw.prepare("SELECT slug, position FROM user_collection_recipes ORDER BY position").all(),
    ).toEqual([
      { slug: "leek", position: 0 },
      { slug: "pea", position: 1 },
    ]);
  });

  it("stores smart filters as JSON and returns them parsed", async () => {
    const db = await createDb();
    const collection = await create(db, {
      name: "Quick soups",
      kind: "smart",
      filters: soupFilters,
      isPinned: false,
      slugs: [],
    });
    expect(collection.filters).toEqual(soupFilters);
    expect(collection.slugs).toEqual([]);
  });

  it("rejects a name that differs only in ASCII case, per user", async () => {
    const db = await createDb();
    await create(db, manual("Soups"));
    expect(await createCollection(db, ANA, manual("soups"), NOW)).toEqual({
      isSaved: false,
      error: "name-taken",
    });
    await create(db, manual("Soups"), BOB);
    await create(db, manual("Šalát"));
    await create(db, manual("šalát"));
  });

  it("does not keep recipe rows when the name is taken", async () => {
    const db = await createDb();
    await create(db, manual("Soups"));
    await createCollection(db, ANA, manual("SOUPS", { slugs: ["leek"] }), NOW);
    expect(db.raw.prepare("SELECT * FROM user_collection_recipes").all()).toEqual([]);
  });

  it("pins at the lowest free position, three at most", async () => {
    const db = await createDb();
    const first = await create(db, manual("A", { isPinned: true }));
    const second = await create(db, manual("B", { isPinned: true }));
    const third = await create(db, manual("C", { isPinned: true }));
    expect([first.pinPosition, second.pinPosition, third.pinPosition]).toEqual([1, 2, 3]);

    expect(await createCollection(db, ANA, manual("D", { isPinned: true }), NOW)).toEqual({
      isSaved: false,
      error: "pins-full",
    });

    expectSaved(await updateCollection(db, ANA, second.id, { ...second, isPinned: false }, NOW));
    const refilled = await create(db, manual("E", { isPinned: true }));
    expect(refilled.pinPosition).toBe(2);

    const otherUser = await create(db, manual("F", { isPinned: true }), BOB);
    expect(otherUser.pinPosition).toBe(1);
  });
});

describe("readCollections", () => {
  it("sorts by name with localeCompare and returns only the user's collections", async () => {
    const db = await createDb();
    await create(db, manual("zucchini"));
    await create(db, manual("Apple"));
    await create(db, manual("Éclairs"));
    await create(db, manual("Bob's"), BOB);
    const names = (await readCollections(db, "Ana@Example.com")).map(
      (collection) => collection.name,
    );
    expect(names).toEqual(["Apple", "Éclairs", "zucchini"]);
  });

  it("returns slugs in position order", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a", "b", "c"] }));
    await reorderRecipes(db, collection.id, ["c", "a", "b"]);
    const [read] = await readCollections(db, ANA);
    expect(read?.slugs).toEqual(["c", "a", "b"]);
  });

  it("returns null filters for a smart collection whose stored filters are no longer valid", async () => {
    const db = await createDb();
    const collection = await create(db, {
      name: "Old",
      kind: "smart",
      filters: soupFilters,
      isPinned: false,
      slugs: [],
    });
    db.raw
      .prepare("UPDATE user_collections SET filters = ? WHERE id = ?")
      .run(JSON.stringify({ tag: ["Gone"], time: ["forever"] }), collection.id);
    const [read] = await readCollections(db, ANA);
    expect(read?.filters).toBeNull();

    db.raw
      .prepare("UPDATE user_collections SET filters = ? WHERE id = ?")
      .run("not json", collection.id);
    const [broken] = await readCollections(db, ANA);
    expect(broken?.filters).toBeNull();
  });
});

describe("readCollection", () => {
  it("does not return another user's collection", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups"));
    expect(await readCollection(db, BOB, collection.id)).toBeUndefined();
    expect(await readCollection(db, ANA, "missing")).toBeUndefined();
    expect((await readCollection(db, ANA, collection.id))?.name).toBe("Soups");
  });
});

describe("updateCollection", () => {
  it("renames, keeps the pin position and keeps filters when none are given", async () => {
    const db = await createDb();
    await create(db, manual("A", { isPinned: true }));
    const smart = await create(db, {
      name: "Quick",
      kind: "smart",
      filters: soupFilters,
      isPinned: true,
      slugs: [],
    });
    const updated = expectSaved(
      await updateCollection(
        db,
        ANA,
        smart.id,
        { name: "Fast", filters: undefined, isPinned: true },
        NOW,
      ),
    );
    expect(updated).toEqual({ ...smart, name: "Fast", pinPosition: 2 });

    const refiltered = expectSaved(
      await updateCollection(
        db,
        ANA,
        smart.id,
        { name: "Fast", filters: { ...soupFilters, tag: ["Dinner"] }, isPinned: false },
        NOW,
      ),
    );
    expect(refiltered.filters?.tag).toEqual(["Dinner"]);
    expect(refiltered.pinPosition).toBeNull();
  });

  it("maps a taken name and full pins to errors", async () => {
    const db = await createDb();
    await create(db, manual("A", { isPinned: true }));
    await create(db, manual("B", { isPinned: true }));
    await create(db, manual("C", { isPinned: true }));
    const other = await create(db, manual("D"));
    expect(
      await updateCollection(db, ANA, other.id, { name: "a", filters: null, isPinned: false }, NOW),
    ).toEqual({ isSaved: false, error: "name-taken" });
    expect(
      await updateCollection(db, ANA, other.id, { name: "D", filters: null, isPinned: true }, NOW),
    ).toEqual({ isSaved: false, error: "pins-full" });
  });

  it("returns undefined for another user's collection", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups"));
    expect(
      await updateCollection(
        db,
        BOB,
        collection.id,
        { name: "Mine", filters: null, isPinned: false },
        NOW,
      ),
    ).toBeUndefined();
    expect((await readCollection(db, ANA, collection.id))?.name).toBe("Soups");
  });
});

describe("deleteCollection", () => {
  it("removes the collection and its recipe rows", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a", "b"] }));
    const kept = await create(db, manual("Cakes", { slugs: ["a"] }));
    expect(await deleteCollection(db, ANA, collection.id)).toBe(true);
    expect(await readCollections(db, ANA)).toEqual([kept]);
    expect(db.raw.prepare("SELECT collection_id FROM user_collection_recipes").all()).toEqual([
      { collection_id: kept.id },
    ]);
  });

  it("does not delete another user's collection", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a"] }));
    expect(await deleteCollection(db, BOB, collection.id)).toBe(false);
    expect((await readCollection(db, ANA, collection.id))?.slugs).toEqual(["a"]);
  });
});

describe("appendRecipes", () => {
  it("appends in order and skips slugs already present", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a", "b"] }));
    await appendRecipes(db, collection.id, ["c", "a", "d"], NOW);
    await appendRecipes(db, collection.id, [], NOW);
    expect((await readCollection(db, ANA, collection.id))?.slugs).toEqual(["a", "b", "c", "d"]);
    expect(
      db.raw
        .prepare("SELECT position FROM user_collection_recipes ORDER BY position")
        .all()
        .map((row) => row.position),
    ).toEqual([0, 1, 2, 3]);
  });
});

describe("removeRecipes", () => {
  it("removes recipes, ignores missing ones and keeps positions contiguous", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a", "b", "c", "d", "e"] }));
    await removeRecipes(db, collection.id, ["a", "c", "missing"]);
    expect(
      db.raw.prepare("SELECT slug, position FROM user_collection_recipes ORDER BY position").all(),
    ).toEqual([
      { slug: "b", position: 0 },
      { slug: "d", position: 1 },
      { slug: "e", position: 2 },
    ]);
    await appendRecipes(db, collection.id, ["f"], NOW);
    expect((await readCollection(db, ANA, collection.id))?.slugs).toEqual(["b", "d", "e", "f"]);
  });
});

describe("reorderRecipes", () => {
  it("rewrites the positions", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a", "b", "c"] }));
    expect(await reorderRecipes(db, collection.id, ["b", "c", "a"])).toBe(true);
    expect((await readCollection(db, ANA, collection.id))?.slugs).toEqual(["b", "c", "a"]);
  });

  it("refuses anything but exactly the stored set", async () => {
    const db = await createDb();
    const collection = await create(db, manual("Soups", { slugs: ["a", "b"] }));
    expect(await reorderRecipes(db, collection.id, ["a"])).toBe(false);
    expect(await reorderRecipes(db, collection.id, ["a", "b", "c"])).toBe(false);
    expect(await reorderRecipes(db, collection.id, ["a", "a"])).toBe(false);
    expect(await reorderRecipes(db, collection.id, ["a", "x"])).toBe(false);
    expect((await readCollection(db, ANA, collection.id))?.slugs).toEqual(["a", "b"]);
  });
});
