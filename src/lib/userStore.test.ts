// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createTestD1 } from "~/lib/testD1.ts";
import { getOrCreateUser, readUser } from "./userStore.ts";

const createDb = () => createTestD1(["0002_users.sql"]);

describe("getOrCreateUser", () => {
  it("creates a first-time user as a viewer", async () => {
    const db = createDb();
    const user = await getOrCreateUser(db, "ana@example.com", "2026-10-09T10:00:00.000Z");
    expect(user).toEqual({ email: "ana@example.com", role: "viewer" });
    expect(db.raw.prepare("SELECT * FROM users").all()).toEqual([
      { email: "ana@example.com", role: "viewer", created_at: "2026-10-09T10:00:00.000Z" },
    ]);
  });

  it("returns an existing user untouched, keeping a manually assigned admin role", async () => {
    const db = createDb();
    await getOrCreateUser(db, "ana@example.com", "2026-10-09T10:00:00.000Z");
    db.raw.exec("UPDATE users SET role = 'admin' WHERE email = 'ana@example.com'");

    const user = await getOrCreateUser(db, "ana@example.com", "2026-10-10T10:00:00.000Z");

    expect(user).toEqual({ email: "ana@example.com", role: "admin" });
    expect(db.raw.prepare("SELECT created_at FROM users").get()).toEqual({
      created_at: "2026-10-09T10:00:00.000Z",
    });
  });

  it("treats emails case-insensitively", async () => {
    const db = createDb();
    await getOrCreateUser(db, "Ana@Example.com", "2026-10-09T10:00:00.000Z");
    const user = await getOrCreateUser(db, "ana@example.com", "2026-10-09T11:00:00.000Z");
    expect(user.email).toBe("ana@example.com");
    expect(db.raw.prepare("SELECT email FROM users").all()).toEqual([{ email: "ana@example.com" }]);
  });
});

describe("readUser", () => {
  it("returns a viewer for an unknown user without creating a row", async () => {
    const db = createDb();
    expect(await readUser(db, "nobody@example.com")).toEqual({
      email: "nobody@example.com",
      role: "viewer",
    });
    expect(db.raw.prepare("SELECT * FROM users").all()).toEqual([]);
  });

  it("rejects roles outside admin and viewer", () => {
    const db = createDb();
    expect(() =>
      db.raw.exec("INSERT INTO users (email, role, created_at) VALUES ('a@b.c', 'owner', 'x')"),
    ).toThrow();
  });
});
