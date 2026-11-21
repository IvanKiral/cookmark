# Cookmark

A private recipe book. Recipes are written to the database by owl-sight; Cookmark shows them, lets you search and filter them, and keeps everyone's favourites and To try list. Admins can edit recipes, give a chef's verdict and mark recipes to delete.

It runs as a Cloudflare Worker (SolidStart) on cookmark.kiralivan.eu, behind Cloudflare Access. Recipes and users live in the D1 database `cookmark-recipes`, and videos, thumbnails and recipe photos in the R2 bucket `cookmark`.

## Local development

You need Node 24 and pnpm (the version is pinned in `package.json`).

```bash
pnpm install
pnpm local:setup   # local database: migrations, 10 sample recipes from seed/recipes, admin@localhost as admin
pnpm dev           # http://localhost:3000, signed in as admin@localhost
```

- `LOCAL_USER_EMAIL=someone@localhost pnpm dev` signs you in as someone else. A new email is a viewer.
- `pnpm local:setup --from-remote` copies the live recipes instead of the samples. It only reads from production and needs `wrangler login`.
- `pnpm local:setup` wipes all local data (users, favourites, edits) every time.
- The local R2 bucket is empty, so thumbnails, videos and recipe photos do not show locally.
- `pnpm local:preview` builds the real Worker and runs it on http://localhost:8787. Use it for a last check before deploying.

Before committing, run `pnpm test`, `pnpm typecheck` and `pnpm biome:check:fix`. CI runs the same checks and a build.

## Deploying

Deploys are manual:

```bash
pnpm build
pnpm exec wrangler deploy
```

The Worker reads two secrets, set once with `wrangler secret put`: `ACCESS_TEAM_DOMAIN` (`https://<team>.cloudflareaccess.com`) and `ACCESS_AUD` (the Access application's AUD tag). Without them nobody is signed in.

Worker settings live in `wrangler.jsonc`. After changing its bindings, run `pnpm cf:types` to regenerate `src/server/worker-configuration.d.ts`.

## Database changes

Migrations in `migrations/` are applied by wrangler, which records them in the `d1_migrations` table. To add one, create the next numbered file and apply it:

```bash
pnpm exec wrangler d1 migrations apply cookmark-recipes --local --config wrangler.jsonc --persist-to .wrangler/state
pnpm exec wrangler d1 migrations apply cookmark-recipes --remote --config wrangler.jsonc
```

Always pass `--config wrangler.jsonc`: after a build, wrangler otherwise picks up the generated config in `.output/server`.

Never write to `recipes` with `INSERT OR REPLACE`. It deletes the row, which resets the verdict and the To delete mark. Use `UPDATE`.

New users are viewers. To make someone an admin:

```bash
pnpm exec wrangler d1 execute cookmark-recipes --remote --config wrangler.jsonc --command \
  "UPDATE users SET role = 'admin' WHERE email = '<email>'"
```

## Undoing a recipe edit

Every admin edit stores the previous version of the recipe in `recipe_revisions`. To restore the version before the latest edit (replace `<slug>` in all three places):

```bash
pnpm exec wrangler d1 execute cookmark-recipes --remote --config wrangler.jsonc --command \
  "UPDATE recipes SET data = (SELECT data FROM recipe_revisions WHERE slug = '<slug>' ORDER BY id DESC LIMIT 1) WHERE slug = '<slug>' AND EXISTS (SELECT 1 FROM recipe_revisions WHERE slug = '<slug>')"
```

`SELECT id, edited_by, edited_at FROM recipe_revisions WHERE slug = '<slug>' ORDER BY id DESC` lists a recipe's history. The undo itself is not recorded.

## Code layout

- `src/routes`: pages and API endpoints. They only wire things together.
- `src/server`: code that runs only in the Worker (D1, R2, Access). Nothing in `src/app` imports it.
- `src/app`: the UI, one folder per feature. `src/app/api` is the only place that talks to the server.
- `src/shared`: types and rules used by both sides, such as recipe types, tags and edit validation.
- `seed/recipes`: the sample recipes for `pnpm local:setup`.
