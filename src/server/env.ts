import { env } from "cloudflare:workers";

// Worker bindings (generated from wrangler.jsonc by `pnpm cf:types`) plus the
// secrets and local variables the app reads.
export type AppEnv = Env & {
  // e.g. https://<team-name>.cloudflareaccess.com
  ACCESS_TEAM_DOMAIN?: string;
  // Application Audience (AUD) tag of the Access application.
  ACCESS_AUD?: string;
  // Local sign-in without Access, honoured only on localhost (see access.ts).
  LOCAL_USER_EMAIL?: string;
};

// The server side always runs in workerd (the Cloudflare Vite plugin runs it
// there in dev too), so the bindings come from the runtime. Tests alias
// `cloudflare:workers` to src/server/testing/cloudflareWorkersStub.ts.
export const getEnv = (): Partial<AppEnv> => env as Partial<AppEnv>;
