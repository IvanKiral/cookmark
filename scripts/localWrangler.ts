import { execFileSync } from "node:child_process";

// Shared by the local:setup and local:preview scripts. The config is generated
// by `pnpm build`; local D1, R2 and KV data live under the state directory.
export const WRANGLER_CONFIG = ".output/server/wrangler.json";
export const LOCAL_STATE_DIR = ".wrangler/state";
export const LOCAL_ADMIN_EMAIL = "admin@localhost";

// Runs wrangler quietly and surfaces its output only when it fails.
export const runWrangler = (args: ReadonlyArray<string>): void => {
  try {
    execFileSync("wrangler", args, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    const { stdout, stderr } = error as { stdout?: Buffer; stderr?: Buffer };
    console.error(stdout?.toString(), stderr?.toString());
    throw new Error(`wrangler ${args.slice(0, 3).join(" ")} failed`);
  }
};
