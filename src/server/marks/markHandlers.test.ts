// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";
import type { APIEvent } from "~/server/apiEvent.ts";
import { setTestEnv } from "~/server/testing/cloudflareWorkersStub.ts";
import { createTestD1, type TestD1 } from "~/server/testing/testD1.ts";
import {
  createAddMarkHandler,
  createReadMarksHandler,
  createRemoveMarkHandler,
} from "./markHandlers.ts";

// Requests carry no Access token, so with DEV stubbed on the user is the dev email.
const createEvent = (slug?: string): APIEvent =>
  ({ request: new Request("http://localhost/"), params: { slug } }) as unknown as APIEvent;

const readSlugs = async (response: Response): Promise<ReadonlyArray<string>> =>
  ((await response.json()) as { slugs: ReadonlyArray<string> }).slugs;

describe("mark handlers", () => {
  const db = (): TestD1 =>
    createTestD1([
      "0002_users.sql",
      "0003_user_recipe_marks.sql",
      "0004_user_recipe_marks_to_try.sql",
    ]);

  afterEach(() => {
    setTestEnv({});
  });

  it("adds, lists and removes marks, creating the user on first add", async () => {
    const testDb = db();
    setTestEnv({ RECIPES: testDb, LOCAL_USER_EMAIL: "dev@localhost" });

    expect((await createAddMarkHandler("to-try")(createEvent("soup"))).status).toBe(204);
    expect(testDb.raw.prepare("SELECT email, role FROM users").all()).toEqual([
      { email: "dev@localhost", role: "viewer" },
    ]);
    expect(await readSlugs(await createReadMarksHandler("to-try")(createEvent()))).toEqual([
      "soup",
    ]);
    expect(await readSlugs(await createReadMarksHandler("favorite")(createEvent()))).toEqual([]);

    expect((await createRemoveMarkHandler("to-try")(createEvent("soup"))).status).toBe(204);
    expect(await readSlugs(await createReadMarksHandler("to-try")(createEvent()))).toEqual([]);
  });

  it("returns 401 without an identity", async () => {
    setTestEnv({ RECIPES: db() });
    expect((await createReadMarksHandler("favorite")(createEvent())).status).toBe(401);
    expect((await createAddMarkHandler("favorite")(createEvent("soup"))).status).toBe(401);
  });

  it("returns 500 when the database binding is missing", async () => {
    setTestEnv({});
    expect((await createRemoveMarkHandler("favorite")(createEvent("soup"))).status).toBe(500);
  });
});
