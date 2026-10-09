import { execFileSync } from "node:child_process";
import { LOCAL_ADMIN_EMAIL, LOCAL_STATE_DIR, WRANGLER_CONFIG } from "./localWrangler.ts";

// Builds the production bundle and serves it with wrangler dev against the
// local D1 data from `pnpm local:setup`, signed in as LOCAL_USER_EMAIL
// (default: the seeded admin) instead of through Cloudflare Access.
//
//   pnpm local:preview
//   LOCAL_USER_EMAIL=someone@localhost pnpm local:preview   (a new email is a viewer)

const PORT = "8787";
const email = process.env.LOCAL_USER_EMAIL ?? LOCAL_ADMIN_EMAIL;

execFileSync("pnpm", ["build"], { stdio: "inherit" });

console.log(`\nServing http://localhost:${PORT} signed in as ${email}\n`);

// --local-upstream keeps the request hostname as localhost. Without it wrangler
// presents the production route's hostname and the app ignores LOCAL_USER_EMAIL.
execFileSync(
  "wrangler",
  [
    "dev",
    "--config",
    WRANGLER_CONFIG,
    "--persist-to",
    LOCAL_STATE_DIR,
    "--local",
    "--port",
    PORT,
    "--local-upstream",
    `localhost:${PORT}`,
    "--var",
    `LOCAL_USER_EMAIL:${email}`,
  ],
  { stdio: "inherit" },
);
