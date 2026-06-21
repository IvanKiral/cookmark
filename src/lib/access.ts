// Identity from Cloudflare Access. Access already blocks unauthenticated
// requests at the edge, so reading the email claim from the forwarded JWT is
// sufficient for keying per-user data (no signature verification needed here).
const FALLBACK_USER = "shared";

const decodeJwtPayload = (token: string): Record<string, unknown> | undefined => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return undefined;
  }
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return undefined;
  }
};

export const getUserEmail = (request: Request): string => {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (token) {
    const email = decodeJwtPayload(token)?.email;
    if (typeof email === "string" && email.length > 0) {
      return email;
    }
  }
  return FALLBACK_USER;
};
