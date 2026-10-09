import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  LOCAL_ADMIN_EMAIL,
  LOCAL_STATE_DIR,
  runWrangler,
  WRANGLER_CONFIG,
} from "./localWrangler.ts";

// Rebuilds the local D1 databases used by `pnpm local:preview` from scratch:
// applies every migration, imports recipes and adds an admin user. All local
// D1 data (favourites, to-try, users) is wiped; R2 and KV are left alone.
//
//   pnpm local:setup                 recipes from ./data/*.json
//   pnpm local:setup --from-remote   recipes copied from the live database (read-only)

// Migrations are applied by hand, so a new migration must also be added here.
const migrationsByDatabase: Record<string, ReadonlyArray<string>> = {
  "cookmark-recipes": [
    "recipes_schema.sql",
    "0002_users.sql",
    "0003_user_recipe_marks.sql",
    "0004_user_recipe_marks_to_try.sql",
    "0005_recipes_chef_pick.sql",
    "0006_recipes_should_delete.sql",
    "0007_recipe_revisions.sql",
  ],
  "cookmark-recipe-inbox": ["0001_recipe_inbox.sql"],
};

const isFromRemote = process.argv.includes("--from-remote");
const workDir = mkdtempSync(path.join(tmpdir(), "cookmark-local-"));

const executeLocal = (database: string, file: string): void =>
  runWrangler([
    "d1",
    "execute",
    database,
    "--local",
    "--config",
    WRANGLER_CONFIG,
    "--persist-to",
    LOCAL_STATE_DIR,
    "--file",
    file,
  ]);

const executeLocalSql = (database: string, name: string, sql: string): void => {
  const file = path.join(workDir, name);
  writeFileSync(file, sql);
  executeLocal(database, file);
};

const sqlString = (value: string): string => `'${value.replaceAll("'", "''")}'`;

const bundleRecipesSql = (): string => {
  const dataDir = path.join(process.cwd(), "data");
  const files = existsSync(dataDir)
    ? readdirSync(dataDir).filter((file) => file.endsWith(".json"))
    : [];
  if (files.length === 0) {
    throw new Error("No recipes in ./data. Run with --from-remote to copy the live recipes.");
  }
  return files
    .map((file) => {
      const json = JSON.stringify(JSON.parse(readFileSync(path.join(dataDir, file), "utf8")));
      const slug = file.replace(/\.json$/, "");
      return `INSERT INTO recipes (slug, data) VALUES (${sqlString(slug)}, ${sqlString(json)});`;
    })
    .join("\n");
};

const remoteRecipesSql = (): string => {
  const file = path.join(workDir, "remote-recipes.sql");
  runWrangler([
    "d1",
    "export",
    "cookmark-recipes",
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
  if (!existsSync(WRANGLER_CONFIG)) {
    console.log("Building to generate the wrangler config...");
    execFileSync("pnpm", ["build"], { stdio: "inherit" });
  }

  console.log("Resetting local D1 databases...");
  rmSync(path.join(LOCAL_STATE_DIR, "v3", "d1"), { recursive: true, force: true });

  for (const [database, migrations] of Object.entries(migrationsByDatabase)) {
    for (const migration of migrations) {
      console.log(`Applying ${migration} to ${database}`);
      executeLocal(database, path.join("migrations", migration));
    }
  }

  console.log(isFromRemote ? "Copying live recipes..." : "Importing recipes from ./data...");
  executeLocalSql(
    "cookmark-recipes",
    "recipes.sql",
    isFromRemote ? remoteRecipesSql() : bundleRecipesSql(),
  );

  console.log(`Adding ${LOCAL_ADMIN_EMAIL} as admin`);
  executeLocalSql(
    "cookmark-recipes",
    "admin.sql",
    `INSERT INTO users (email, role, created_at) VALUES (${sqlString(LOCAL_ADMIN_EMAIL)}, 'admin', ${sqlString(new Date().toISOString())});`,
  );

  console.log("Local databases ready. Start the app with: pnpm local:preview");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
