import { createRemoteJWKSet, type JWTVerifyGetKey, jwtVerify } from "jose";

// Identity from Cloudflare Access. The signed application token is verified
// against the team's public keys, so a request that reaches the Worker without
// passing through Access (or with a forged token) has no identity.

type AccessEnv = {
  // e.g. https://<team-name>.cloudflareaccess.com
  ACCESS_TEAM_DOMAIN?: string;
  // Application Audience (AUD) Tag of the Access application.
  ACCESS_AUD?: string;
};

export type AccessConfig = {
  teamDomain: string;
  audience: string;
};

// `vinxi dev` has no Access in front of it. import.meta.env.DEV is replaced
// with false in production builds, so this never applies to a deployed Worker.
const DEV_USER_EMAIL = "dev@localhost";

const getAccessConfig = (): AccessConfig | undefined => {
  const env = (globalThis as unknown as { __env__?: AccessEnv }).__env__;
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
    return import.meta.env.DEV ? DEV_USER_EMAIL : undefined;
  }
  const config = getAccessConfig();
  if (!config) {
    return undefined;
  }
  return await verifyAccessToken(token, getKeySet(config.teamDomain), config);
};
