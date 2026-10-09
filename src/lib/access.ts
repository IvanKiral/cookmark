import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from "jose";

// Identity from Cloudflare Access. The signed application token is verified
// against the team's public keys, so a request that reaches the Worker without
// passing through Access (or with a forged token) has no identity.

type AccessEnv = {
  // e.g. https://<team-name>.cloudflareaccess.com
  ACCESS_TEAM_DOMAIN?: string;
  // Application Audience (AUD) Tag of the Access application.
  ACCESS_AUD?: string;
  // Set only by `pnpm local:preview` (wrangler dev). See getLocalUserEmail.
  LOCAL_USER_EMAIL?: string;
};

export type AccessConfig = {
  teamDomain: string;
  audience: string;
};

// `vinxi dev` has no Access in front of it. import.meta.env.DEV is replaced
// with false in production builds, so this never applies to a deployed Worker.
const DEV_USER_EMAIL = "dev@localhost";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

const getEnv = (): AccessEnv | undefined =>
  (globalThis as unknown as { __env__?: AccessEnv }).__env__;

// Lets the production build run under `wrangler dev` as a signed-in user
// without Access. Honoured only for requests to localhost: in production the
// Worker is reachable solely through its custom domain, so it never applies
// there even if the variable were set by mistake.
const getLocalUserEmail = (request: Request): string | undefined => {
  const email = getEnv()?.LOCAL_USER_EMAIL;
  if (!email) {
    return undefined;
  }
  return LOCAL_HOSTNAMES.has(new URL(request.url).hostname) ? email : undefined;
};

const getAccessConfig = (): AccessConfig | undefined => {
  const env = getEnv();
  const teamDomain = env?.ACCESS_TEAM_DOMAIN;
  const audience = env?.ACCESS_AUD;
  if (!(teamDomain && audience)) {
    return undefined;
  }
  return { teamDomain, audience };
};

// Kept across requests so the fetched keys are reused (jose caches them and
// refetches when it sees an unknown key id after a rotation).
const keySetsByTeamDomain = new Map<string, JWTVerifyGetKey>();

const getKeySet = (teamDomain: string): JWTVerifyGetKey => {
  const cached = keySetsByTeamDomain.get(teamDomain);
  if (cached) {
    return cached;
  }
  const keySet = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
  keySetsByTeamDomain.set(teamDomain, keySet);
  return keySet;
};

export const verifyAccessToken = async (
  token: string,
  keySet: JWTVerifyGetKey,
  config: AccessConfig,
): Promise<string | undefined> => {
  try {
    const { payload } = await jwtVerify(token, keySet, {
      issuer: config.teamDomain,
      audience: config.audience,
    });
    return typeof payload.email === "string" && payload.email.length > 0
      ? payload.email
      : undefined;
  } catch {
    return undefined;
  }
};

export const getUserEmail = async (request: Request): Promise<string | undefined> => {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) {
    return import.meta.env.DEV ? DEV_USER_EMAIL : getLocalUserEmail(request);
  }
  const config = getAccessConfig();
  if (!config) {
    return undefined;
  }
  return await verifyAccessToken(token, getKeySet(config.teamDomain), config);
};
