import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  LOCAL_ADMIN_EMAIL,
  LOCAL_STATE_DIR,
  RECIPES_DATABASE,
  runWrangler,
  WRANGLER_CONFIG,
} from "./localWrangler.ts";

// Rebuilds the local D1 database used by `pnpm dev` and `pnpm local:preview`:
// applies the migrations, imports recipes and adds an admin user. All local D1
// data (favourites, to-try, users, revisions) is wiped; R2 is left alone.
//
//   pnpm local:setup                 sample recipes from ./seed/recipes
//   pnpm local:setup --from-remote   recipes copied from the live database (read-only)

const SEED_DIR = path.join("seed", "recipes");

const isFromRemote = process.argv.includes("--from-remote");
const workDir = mkdtempSync(path.join(tmpdir(), "cookmark-local-"));

const localArgs = ["--local", "--config", WRANGLER_CONFIG, "--persist-to", LOCAL_STATE_DIR];

const executeLocalSql = (name: string, sql: string): void => {
  const file = path.join(workDir, name);
  writeFileSync(file, sql);
  runWrangler(["d1", "execute", RECIPES_DATABASE, ...localArgs, "--file", file]);
};

const sqlString = (value: string): string => `'${value.replaceAll("'", "''")}'`;

const seedRecipesSql = (): string =>
  readdirSync(SEED_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const json = JSON.stringify(JSON.parse(readFileSync(path.join(SEED_DIR, file), "utf8")));
      const slug = file.replace(/\.json$/, "");
      return `INSERT INTO recipes (slug, data) VALUES (${sqlString(slug)}, ${sqlString(json)});`;
    })
    .join("\n");

const remoteRecipesSql = (): string => {
  const file = path.join(workDir, "remote-recipes.sql");
  runWrangler([
    "d1",
    "export",
    RECIPES_DATABASE,
    "--remote",
    "--config",
    WRANGLER_CONFIG,
    "--table",
    "recipes",
    "--no-schema",
    "--output",
    file,
  ]);
  return readFileSync(file, "utf8");
};

try {
  console.log("Resetting the local D1 database...");
  rmSync(path.join(LOCAL_STATE_DIR, "v3", "d1"), { recursive: true, force: true });

  console.log("Applying migrations...");
  runWrangler(["d1", "migrations", "apply", RECIPES_DATABASE, ...localArgs]);

  console.log(isFromRemote ? "Copying live recipes..." : `Importing recipes from ./${SEED_DIR}...`);
  executeLocalSql("recipes.sql", isFromRemote ? remoteRecipesSql() : seedRecipesSql());

  console.log(`Adding ${LOCAL_ADMIN_EMAIL} as admin`);
  executeLocalSql(
    "admin.sql",
    `INSERT INTO users (email, role, created_at) VALUES (${sqlString(LOCAL_ADMIN_EMAIL)}, 'admin', ${sqlString(new Date().toISOString())});`,
  );

  console.log("Local database ready. Start the app with: pnpm dev (or pnpm local:preview)");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
