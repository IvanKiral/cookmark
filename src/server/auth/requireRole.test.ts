// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { setTestEnv } from "~/server/testing/cloudflareWorkersStub.ts";
import { createTestD1 } from "~/server/testing/testD1.ts";
import { hasRole, requireRole } from "./requireRole.ts";

describe("hasRole", () => {
  it("lets admins do everything a viewer can", () => {
    expect(hasRole("admin", "viewer")).toBe(true);
    expect(hasRole("admin", "admin")).toBe(true);
  });

  it("keeps viewers out of admin actions", () => {
    expect(hasRole("viewer", "viewer")).toBe(true);
    expect(hasRole("viewer", "admin")).toBe(false);
  });
});

// Requests carry no Access token, so the user is LOCAL_USER_EMAIL (localhost only).
describe("requireRole", () => {
  const request = new Request("http://localhost/");

  afterEach(() => {
    setTestEnv({});
  });

  it("returns 401 when there is no identity", async () => {
    setTestEnv({});
    const check = await requireRole(request, "viewer");
    expect(check.isAllowed ? undefined : check.response.status).toBe(401);
  });

  it("returns 500 when the database binding is missing", async () => {
    setTestEnv({ LOCAL_USER_EMAIL: "dev@localhost" });
    const check = await requireRole(request, "viewer");
    expect(check.isAllowed ? undefined : check.response.status).toBe(500);
  });

  it("returns 403 for a viewer on an admin action", async () => {
    setTestEnv({
      RECIPES: createTestD1(["0002_users.sql"]),
      LOCAL_USER_EMAIL: "dev@localhost",
    });
    const check = await requireRole(request, "admin");
    expect(check.isAllowed ? undefined : check.response.status).toBe(403);
  });

  it("allows an admin and returns the user", async () => {
    const db = createTestD1(["0002_users.sql"]);
    db.raw.exec(
      "INSERT INTO users (email, role, created_at) VALUES ('dev@localhost', 'admin', 'x')",
    );
    setTestEnv({ RECIPES: db, LOCAL_USER_EMAIL: "dev@localhost" });
    const check = await requireRole(request, "admin");
    expect(check.isAllowed ? check.user : undefined).toEqual({
      email: "dev@localhost",
      role: "admin",
    });
  });
});
