import process from "node:process";
import { getPlatformProxy } from "wrangler";

const LOCAL_ADMIN_EMAIL = "admin@localhost";

// Local D1 and R2 from the same .wrangler/state that `pnpm local:setup` fills,
// signed in as LOCAL_USER_EMAIL (default: the seeded admin).
const proxy = await getPlatformProxy<Env>({
  configPath: "wrangler.jsonc",
  persist: { path: ".wrangler/state/v3" },
});

(globalThis as unknown as { __env__: unknown }).__env__ = {
  ...proxy.env,
  LOCAL_USER_EMAIL: process.env.LOCAL_USER_EMAIL ?? LOCAL_ADMIN_EMAIL,
};
