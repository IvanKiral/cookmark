import process from "node:process";
import { getPlatformProxy, type PlatformProxy } from "wrangler";

const LOCAL_ADMIN_EMAIL = "admin@localhost";

// vinxi loads this module once per router (pages and server functions) in the
// same process, so the proxy is kept on globalThis to start one workerd only.
const globalWithProxy = globalThis as unknown as {
  __cookmarkDevProxy__?: Promise<PlatformProxy<Env>>;
  __env__?: unknown;
};

// Local D1 and R2 from the same .wrangler/state that `pnpm local:setup` fills,
// signed in as LOCAL_USER_EMAIL (default: the seeded admin).
globalWithProxy.__cookmarkDevProxy__ ??= getPlatformProxy<Env>({
  configPath: "wrangler.jsonc",
  persist: { path: ".wrangler/state/v3" },
});

const proxy = await globalWithProxy.__cookmarkDevProxy__;

globalWithProxy.__env__ = {
  ...proxy.env,
  LOCAL_USER_EMAIL: process.env.LOCAL_USER_EMAIL ?? LOCAL_ADMIN_EMAIL,
};
