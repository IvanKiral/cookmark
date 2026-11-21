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

// `pnpm dev` runs in Node, where nothing provides the Worker bindings, so they
// are emulated by wrangler once at startup. The MODE check is replaced at build
// time, which drops this from the Worker bundle; tests run in "test" mode and
// stub the env themselves.
if (import.meta.env.MODE === "development") {
  await import("./devEnv.ts");
}

// nitro's cloudflare-module runtime sets globalThis.__env__ to the Worker env
// on every request, so only read it inside the request lifecycle.
export const getEnv = (): Partial<AppEnv> =>
  (globalThis as unknown as { __env__?: Partial<AppEnv> }).__env__ ?? {};
