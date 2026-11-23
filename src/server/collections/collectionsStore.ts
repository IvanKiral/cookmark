import { normalizeEmail } from "~/server/auth/userStore.ts";
import { getEnv } from "~/server/env.ts";
import {
  type Collection,
  type CollectionKind,
  parseSmartFilters,
  type SmartFilters,
} from "~/shared/collections.ts";

// Per-user collections live in the recipes database, next to users and marks.
export const getCollectionsDb = (): D1Database | undefined => getEnv().RECIPES;

type CollectionRow = {
  id: string;
  name: string;
  kind: CollectionKind;
  filters: string | null;
  pin_position: number | null;
};

type CollectionRecipeRow = {
  collection_id: string;
  slug: string;
};

export type NewCollection = {
  name: string;
  kind: CollectionKind;
  filters: SmartFilters | null;
  isPinned: boolean;
  slugs: ReadonlyArray<string>;
};

export type CollectionUpdate = {
  name: string;
  // undefined keeps the stored filters.
  filters: SmartFilters | null | undefined;
  isPinned: boolean;
};

export type ConstraintError = "name-taken" | "pins-full";

export type CollectionWriteResult =
  | { isSaved: true; collection: Collection }
  | { isSaved: false; error: ConstraintError };

const COLLECTION_COLUMNS = "id, name, kind, filters, pin_position";

// The lowest free pin of the user. With all three taken it picks 1, so the
// unique pin index rejects the write and the database stays the only judge.
const LOWEST_FREE_PIN = `(
  SELECT COALESCE(MIN(slot), 1)
  FROM (SELECT 1 AS slot UNION ALL SELECT 2 UNION ALL SELECT 3)
  WHERE slot NOT IN (
    SELECT pin_position FROM user_collections WHERE email = ? AND pin_position IS NOT NULL
  )
)`;

const parseStoredFilters = (filters: string | null): SmartFilters | null => {
  if (filters === null) {
    return null;
  }
  try {
    return parseSmartFilters(JSON.parse(filters)) ?? null;
  } catch {
    return null;
  }
};

const parsePinPosition = (value: number | null): Collection["pinPosition"] =>
  value === 1 || value === 2 || value === 3 ? value : null;

const toCollection = (row: CollectionRow, slugs: ReadonlyArray<string>): Collection => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  filters: row.kind === "smart" ? parseStoredFilters(row.filters) : null,
  pinPosition: parsePinPosition(row.pin_position),
  slugs: row.kind === "manual" ? slugs : [],
});

const serializeFilters = (filters: SmartFilters | null | undefined): string | null =>
  filters ? JSON.stringify(filters) : null;

const getErrorText = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }
  return `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}`;
};

// D1 and SQLite name the columns of the violated unique index in the message.
const toConstraintError = (error: unknown): ConstraintError | undefined => {
  const text = getErrorText(error);
  if (!text.includes("UNIQUE constraint failed")) {
    return undefined;
  }
  if (text.includes("user_collections.pin_position")) {
    return "pins-full";
  }
  if (text.includes("user_collections.name")) {
    return "name-taken";
  }
  return undefined;
};

const groupSlugs = (
  rows: ReadonlyArray<CollectionRecipeRow>,
): ReadonlyMap<string, ReadonlyArray<string>> =>
  rows.reduce((groups, row) => {
    groups.set(row.collection_id, [...(groups.get(row.collection_id) ?? []), row.slug]);
    return groups;
  }, new Map<string, ReadonlyArray<string>>());

// Sorted by name with localeCompare, so accented names sort like the UI expects.
export const readCollections = async (
  db: D1Database,
  email: string,
): Promise<ReadonlyArray<Collection>> => {
  const normalizedEmail = normalizeEmail(email);
  const [collections, recipes] = await Promise.all([
    db
      .prepare(`SELECT ${COLLECTION_COLUMNS} FROM user_collections WHERE email = ?`)
      .bind(normalizedEmail)
      .all<CollectionRow>(),
    db
      .prepare(
        `SELECT r.collection_id, r.slug
         FROM user_collection_recipes AS r
         JOIN user_collections AS c ON c.id = r.collection_id
         WHERE c.email = ?
         ORDER BY r.collection_id, r.position`,
      )
      .bind(normalizedEmail)
      .all<CollectionRecipeRow>(),
  ]);
  const slugsByCollection = groupSlugs(recipes.results);
  return collections.results
    .map((row) => toCollection(row, slugsByCollection.get(row.id) ?? []))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// undefined when the collection does not exist or belongs to another user.
export const readCollection = async (
  db: D1Database,
  email: string,
  id: string,
): Promise<Collection | undefined> => {
  const row = await db
    .prepare(`SELECT ${COLLECTION_COLUMNS} FROM user_collections WHERE id = ? AND email = ?`)
    .bind(id, normalizeEmail(email))
    .first<CollectionRow>();
  if (!row) {
    return undefined;
  }
  const slugs = await readCollectionSlugs(db, id);
  return toCollection(row, slugs);
};

export const readCollectionSlugs = async (
  db: D1Database,
  collectionId: string,
): Promise<ReadonlyArray<string>> => {
  const { results } = await db
    .prepare("SELECT slug FROM user_collection_recipes WHERE collection_id = ? ORDER BY position")
    .bind(collectionId)
    .all<{ slug: string }>();
  return results.map((row) => row.slug);
};

// Slugs already in the collection are skipped; the rest go to the end in the given order.
const prepareAppend = (
  db: D1Database,
  collectionId: string,
  slugs: ReadonlyArray<string>,
  now: string,
): ReadonlyArray<D1PreparedStatement> =>
  slugs.map((slug) =>
    db
      .prepare(
        `INSERT INTO user_collection_recipes (collection_id, slug, position, added_at)
         SELECT ?, ?, COALESCE(MAX(position), -1) + 1, ?
         FROM user_collection_recipes WHERE collection_id = ?
         ON CONFLICT DO NOTHING`,
      )
      .bind(collectionId, slug, now, collectionId),
  );

// The user row must exist first (email references users).
export const createCollection = async (
  db: D1Database,
  email: string,
  collection: NewCollection,
  now: string,
): Promise<CollectionWriteResult> => {
  const id = crypto.randomUUID();
  const normalizedEmail = normalizeEmail(email);
  const insert = db
    .prepare(
      `INSERT INTO user_collections
         (id, email, name, kind, filters, pin_position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CASE WHEN ? THEN ${LOWEST_FREE_PIN} ELSE NULL END, ?, ?)`,
    )
    .bind(
      id,
      normalizedEmail,
      collection.name,
      collection.kind,
      serializeFilters(collection.filters),
      collection.isPinned ? 1 : 0,
      normalizedEmail,
      now,
      now,
    );
  try {
    await db.batch([insert, ...prepareAppend(db, id, collection.slugs, now)]);
  } catch (error) {
    const constraintError = toConstraintError(error);
    if (!constraintError) {
      throw error;
    }
    return { isSaved: false, error: constraintError };
  }
  const created = await readCollection(db, normalizedEmail, id);
  if (!created) {
    throw new Error("Created collection could not be read back");
  }
  return { isSaved: true, collection: created };
};

// undefined when the collection does not exist or belongs to another user. A
// pinned collection keeps its position; a newly pinned one takes the lowest free.
export const updateCollection = async (
  db: D1Database,
  email: string,
  id: string,
  update: CollectionUpdate,
  now: string,
): Promise<CollectionWriteResult | undefined> => {
  const normalizedEmail = normalizeEmail(email);
  try {
    const result = await db
      .prepare(
        `UPDATE user_collections
         SET name = ?,
             filters = COALESCE(?, filters),
             pin_position = CASE WHEN ? THEN COALESCE(pin_position, ${LOWEST_FREE_PIN}) ELSE NULL END,
             updated_at = ?
         WHERE id = ? AND email = ?`,
      )
      .bind(
        update.name,
        serializeFilters(update.filters),
        update.isPinned ? 1 : 0,
        normalizedEmail,
        now,
        id,
        normalizedEmail,
      )
      .run();
    if (result.meta.changes === 0) {
      return undefined;
    }
  } catch (error) {
    const constraintError = toConstraintError(error);
    if (!constraintError) {
      throw error;
    }
    return { isSaved: false, error: constraintError };
  }
  const updated = await readCollection(db, normalizedEmail, id);
  return updated ? { isSaved: true, collection: updated } : undefined;
};

// Returns whether a collection of this user was deleted.
export const deleteCollection = async (
  db: D1Database,
  email: string,
  id: string,
): Promise<boolean> => {
  const normalizedEmail = normalizeEmail(email);
  const [, deleted] = await db.batch([
    db
      .prepare(
        `DELETE FROM user_collection_recipes
         WHERE collection_id = (SELECT id FROM user_collections WHERE id = ? AND email = ?)`,
      )
      .bind(id, normalizedEmail),
    db.prepare("DELETE FROM user_collections WHERE id = ? AND email = ?").bind(id, normalizedEmail),
  ]);
  return (deleted?.meta.changes ?? 0) > 0;
};

export const appendRecipes = async (
  db: D1Database,
  collectionId: string,
  slugs: ReadonlyArray<string>,
  now: string,
): Promise<void> => {
  if (slugs.length === 0) {
    return;
  }
  await db.batch([...prepareAppend(db, collectionId, slugs, now)]);
};

// Renumbers the remaining recipes so positions stay contiguous from 0.
export const removeRecipes = async (
  db: D1Database,
  collectionId: string,
  slugs: ReadonlyArray<string>,
): Promise<void> => {
  if (slugs.length === 0) {
    return;
  }
  await db.batch([
    db
      .prepare(
        `DELETE FROM user_collection_recipes
         WHERE collection_id = ? AND slug IN (SELECT value FROM json_each(?))`,
      )
      .bind(collectionId, JSON.stringify(slugs)),
    db
      .prepare(
        `UPDATE user_collection_recipes
         SET position = ranked.new_position
         FROM (
           SELECT slug, ROW_NUMBER() OVER (ORDER BY position) - 1 AS new_position
           FROM user_collection_recipes WHERE collection_id = ?
         ) AS ranked
         WHERE user_collection_recipes.collection_id = ?
           AND user_collection_recipes.slug = ranked.slug`,
      )
      .bind(collectionId, collectionId),
  ]);
};

const isSameSet = (stored: ReadonlyArray<string>, sent: ReadonlyArray<string>): boolean => {
  const sentSet = new Set(sent);
  return (
    stored.length === sent.length &&
    sentSet.size === sent.length &&
    stored.every((slug) => sentSet.has(slug))
  );
};

// Returns false when the slugs are not exactly the stored set (another tab
// added or removed a recipe in the meantime).
export const reorderRecipes = async (
  db: D1Database,
  collectionId: string,
  slugs: ReadonlyArray<string>,
): Promise<boolean> => {
  const stored = await readCollectionSlugs(db, collectionId);
  if (!isSameSet(stored, slugs)) {
    return false;
  }
  if (slugs.length === 0) {
    return true;
  }
  await db.batch(
    slugs.map((slug, position) =>
      db
        .prepare(
          "UPDATE user_collection_recipes SET position = ? WHERE collection_id = ? AND slug = ?",
        )
        .bind(position, collectionId, slug),
    ),
  );
  return true;
};
