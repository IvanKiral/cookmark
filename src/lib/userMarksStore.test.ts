// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createTestD1, readMigration } from "~/lib/testD1.ts";
import { addMark, readMarkedSlugs, removeMark } from "./userMarksStore.ts";
import { getOrCreateUser } from "./userStore.ts";

const migrations = [
  "0002_users.sql",
  "0003_user_recipe_marks.sql",
  "0004_user_recipe_marks_to_try.sql",
];

const createDb = () => createTestD1(migrations);

const createDbWithUser = async (email: string) => {
  const db = createDb();
  await getOrCreateUser(db, email, "2026-10-09T10:00:00.000Z");
  return db;
};

describe("user recipe marks", () => {
  it("returns marked slugs in the order they were added", async () => {
    const db = await createDbWithUser("ana@example.com");
    await addMark(db, "ana@example.com", "soup", "favorite", "2026-10-09T10:00:02.000Z");
    await addMark(db, "ana@example.com", "cake", "favorite", "2026-10-09T10:00:01.000Z");
    expect(await readMarkedSlugs(db, "ana@example.com", "favorite")).toEqual(["cake", "soup"]);
  });

  it("ignores adding the same mark twice", async () => {
    const db = await createDbWithUser("ana@example.com");
    await addMark(db, "ana@example.com", "soup", "favorite", "2026-10-09T10:00:00.000Z");
    await addMark(db, "ana@example.com", "soup", "favorite", "2026-10-09T11:00:00.000Z");
    expect(await readMarkedSlugs(db, "ana@example.com", "favorite")).toEqual(["soup"]);
  });

  it("removes a mark and ignores removing one that does not exist", async () => {
    const db = await createDbWithUser("ana@example.com");
    await addMark(db, "ana@example.com", "soup", "favorite", "2026-10-09T10:00:00.000Z");
    await removeMark(db, "ana@example.com", "soup", "favorite");
    await removeMark(db, "ana@example.com", "cake", "favorite");
    expect(await readMarkedSlugs(db, "ana@example.com", "favorite")).toEqual([]);
  });

  it("keeps each user's marks separate and treats emails case-insensitively", async () => {
    const db = await createDbWithUser("ana@example.com");
    await getOrCreateUser(db, "bob@example.com", "2026-10-09T10:00:00.000Z");
    await addMark(db, "Ana@Example.com", "soup", "favorite", "2026-10-09T10:00:00.000Z");
    await addMark(db, "bob@example.com", "cake", "favorite", "2026-10-09T10:00:00.000Z");
    expect(await readMarkedSlugs(db, "ana@example.com", "favorite")).toEqual(["soup"]);
    expect(await readMarkedSlugs(db, "BOB@example.com", "favorite")).toEqual(["cake"]);
  });

  it("rejects a mark for a user that does not exist", async () => {
    const db = createDb();
    await expect(
      addMark(db, "ghost@example.com", "soup", "favorite", "2026-10-09T10:00:00.000Z"),
    ).rejects.toThrow(/FOREIGN KEY/);
  });

  it("rejects unknown mark types", () => {
    const db = createDb();
    db.raw.exec(
      "INSERT INTO users (email, created_at) VALUES ('ana@example.com', '2026-10-09T10:00:00.000Z')",
    );
    expect(() =>
      db.raw.exec(
        "INSERT INTO user_recipe_marks (email, slug, mark, created_at) VALUES ('ana@example.com', 'soup', 'pinned', 'x')",
      ),
    ).toThrow(/CHECK/);
  });

  it("keeps favourites and to-try marks separate", async () => {
    const db = await createDbWithUser("ana@example.com");
    await addMark(db, "ana@example.com", "soup", "favorite", "2026-10-09T10:00:00.000Z");
    await addMark(db, "ana@example.com", "cake", "to-try", "2026-10-09T10:00:00.000Z");
    await addMark(db, "ana@example.com", "soup", "to-try", "2026-10-09T10:00:01.000Z");
    await removeMark(db, "ana@example.com", "soup", "favorite");
    expect(await readMarkedSlugs(db, "ana@example.com", "favorite")).toEqual([]);
    expect(await readMarkedSlugs(db, "ana@example.com", "to-try")).toEqual(["cake", "soup"]);
  });
});

describe("0004 migration", () => {
  it("keeps existing favourites when rebuilding the table", async () => {
    const db = createTestD1(migrations.slice(0, 2));
    await getOrCreateUser(db, "ana@example.com", "2026-10-09T10:00:00.000Z");
    await addMark(db, "ana@example.com", "soup", "favorite", "2026-10-09T10:00:00.000Z");

    db.raw.exec(readMigration("0004_user_recipe_marks_to_try.sql"));

    expect(db.raw.prepare("SELECT * FROM user_recipe_marks").all()).toEqual([
      {
        email: "ana@example.com",
        slug: "soup",
        mark: "favorite",
        created_at: "2026-10-09T10:00:00.000Z",
      },
    ]);
    await expect(
      addMark(db, "ghost@example.com", "soup", "to-try", "2026-10-09T10:00:00.000Z"),
    ).rejects.toThrow(/FOREIGN KEY/);
  });
});
