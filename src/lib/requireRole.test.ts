// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestD1 } from "~/lib/testD1.ts";
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

// Requests carry no Access token, so with DEV stubbed on the user is the dev email.
describe("requireRole", () => {
  const request = new Request("http://localhost/");

  beforeEach(() => {
    vi.stubEnv("DEV", true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns 401 when there is no identity", async () => {
    vi.stubEnv("DEV", false);
    const check = await requireRole(request, "viewer");
    expect(check.isAllowed ? undefined : check.response.status).toBe(401);
  });

  it("returns 500 when the database binding is missing", async () => {
    vi.stubGlobal("__env__", {});
    const check = await requireRole(request, "viewer");
    expect(check.isAllowed ? undefined : check.response.status).toBe(500);
  });

  it("returns 403 for a viewer on an admin action", async () => {
    vi.stubGlobal("__env__", { RECIPES: createTestD1("0002_users.sql") });
    const check = await requireRole(request, "admin");
    expect(check.isAllowed ? undefined : check.response.status).toBe(403);
  });

  it("allows an admin and returns the user", async () => {
    const db = createTestD1("0002_users.sql");
    db.raw.exec(
      "INSERT INTO users (email, role, created_at) VALUES ('dev@localhost', 'admin', 'x')",
    );
    vi.stubGlobal("__env__", { RECIPES: db });
    const check = await requireRole(request, "admin");
    expect(check.isAllowed ? check.user : undefined).toEqual({
      email: "dev@localhost",
      role: "admin",
    });
  });
});
