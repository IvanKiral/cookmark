// @vitest-environment node
import { createLocalJWKSet, exportJWK, generateKeyPair, type JWTPayload, SignJWT } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type AccessConfig, getUserEmail, verifyAccessToken } from "./access.ts";

const config: AccessConfig = {
  teamDomain: "https://test-team.cloudflareaccess.com",
  audience: "test-aud",
};

const createSigner = async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = { ...(await exportJWK(publicKey)), kid: "test-key", alg: "RS256" };
  const keySet = createLocalJWKSet({ keys: [publicJwk] });
  const sign = (payload: JWTPayload, overrides: Partial<AccessConfig> = {}): Promise<string> =>
    new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256", kid: "test-key" })
      .setIssuer(overrides.teamDomain ?? config.teamDomain)
      .setAudience(overrides.audience ?? config.audience)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);
  return { keySet, sign };
};

describe("verifyAccessToken", () => {
  it("returns the email from a valid token", async () => {
    const { keySet, sign } = await createSigner();
    const token = await sign({ email: "ana@example.com" });
    expect(await verifyAccessToken(token, keySet, config)).toBe("ana@example.com");
  });

  it("rejects a token for another Access application", async () => {
    const { keySet, sign } = await createSigner();
    const token = await sign({ email: "ana@example.com" }, { audience: "other-aud" });
    expect(await verifyAccessToken(token, keySet, config)).toBeUndefined();
  });

  it("rejects a token from another issuer", async () => {
    const { keySet, sign } = await createSigner();
    const token = await sign(
      { email: "ana@example.com" },
      { teamDomain: "https://other.cloudflareaccess.com" },
    );
    expect(await verifyAccessToken(token, keySet, config)).toBeUndefined();
  });

  it("rejects a token signed with an unknown key", async () => {
    const { keySet } = await createSigner();
    const forger = await createSigner();
    const token = await forger.sign({ email: "ana@example.com" });
    expect(await verifyAccessToken(token, keySet, config)).toBeUndefined();
  });

  it("returns undefined for a token without an email (service token)", async () => {
    const { keySet, sign } = await createSigner();
    const token = await sign({ common_name: "ingest-bot" });
    expect(await verifyAccessToken(token, keySet, config)).toBeUndefined();
  });
});

describe("getUserEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the dev email when running without Access in development", async () => {
    vi.stubEnv("DEV", true);
    expect(await getUserEmail(new Request("http://localhost/"))).toBe("dev@localhost");
  });

  it("has no identity without a token in production", async () => {
    vi.stubEnv("DEV", false);
    expect(await getUserEmail(new Request("http://localhost/"))).toBeUndefined();
  });

  it("has no identity when the Access secrets are not configured", async () => {
    vi.stubGlobal("__env__", {});
    const { sign } = await createSigner();
    const request = new Request("http://localhost/", {
      headers: { "cf-access-jwt-assertion": await sign({ email: "ana@example.com" }) },
    });
    expect(await getUserEmail(request)).toBeUndefined();
  });

  it("uses LOCAL_USER_EMAIL for requests to localhost without a token", async () => {
    vi.stubEnv("DEV", false);
    vi.stubGlobal("__env__", { LOCAL_USER_EMAIL: "admin@localhost" });
    expect(await getUserEmail(new Request("http://localhost:8787/api/me"))).toBe("admin@localhost");
    expect(await getUserEmail(new Request("http://127.0.0.1:8787/api/me"))).toBe("admin@localhost");
  });

  it("ignores LOCAL_USER_EMAIL on any other hostname", async () => {
    vi.stubEnv("DEV", false);
    vi.stubGlobal("__env__", { LOCAL_USER_EMAIL: "admin@localhost" });
    expect(await getUserEmail(new Request("https://cookmark.kiralivan.eu/api/me"))).toBeUndefined();
  });
});
