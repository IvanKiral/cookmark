# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cookmark is a private recipe book built with SolidStart and deployed manually as a Cloudflare Worker behind Cloudflare Access. Recipes live in the D1 database `cookmark-recipes` (written by owl-sight), media in the R2 bucket `cookmark`. See README.md for setup, deploys and database changes.

## Commands

```bash
pnpm local:setup     # Recreate the local D1 database: migrations, seed/recipes, admin@localhost
pnpm dev             # Dev server on :3000 with local D1/R2, signed in as LOCAL_USER_EMAIL (default admin@localhost)
pnpm local:preview   # Build and run the real Worker on :8787
pnpm build           # Production build (.output)
pnpm test            # Vitest
pnpm typecheck
pnpm biome:check:fix
pnpm cf:types        # Regenerate src/server/worker-configuration.d.ts after changing wrangler.jsonc
```

Wrangler commands against D1 must pass `--config wrangler.jsonc`; after a build wrangler otherwise uses the generated `.output/server/wrangler.json`.

## Structure

- `src/routes`: SolidStart pages (default exports) and API endpoints. Keep them thin: API files only re-export a handler from `src/server`.
- `src/server`: Worker-only code (D1 stores and handlers, R2 media, Access auth). Read bindings with `getEnv()` from `src/server/env.ts`. `src/app` must never import from here.
- `src/app/<feature>`: UI grouped by feature (recipe-list, filters, recipe-page, marks, verdicts, admin, user, pwa) plus `ui/` for generic pieces. Each feature has its own `strings.ts`.
- `src/app/api`: the only bridge to the server: `"use server"` queries and fetch wrappers for `/api/*`.
- `src/shared`: types and logic used by both sides (recipe types, tags, verdicts, edit validation). It must not import from `app` or `server`, and returns error codes instead of UI text.
- `migrations/`: D1 migrations, applied with `wrangler d1 migrations apply`.
- `seed/recipes`: sample recipes for local setup.

## Conventions

- Named exports only. Default exports are allowed only where the framework needs them (route pages, `app.tsx`, entry files, tool configs); Biome enforces this.
- Imports: `./` for files in the same folder, `~/` for everything else, never `../`. Always use the real `.ts`/`.tsx` extension.
- All UI text goes in the feature's `strings.ts` so the app can be translated later.
- `RecipeSummary` is the slim list shape, `Recipe` the full recipe.
- Tests are co-located (`*.test.ts(x)`). Server store tests run real SQL against the migrations via `src/server/testing/testD1.ts`.

### Core Principles
- **Prioritize readability over performance** - Focus on clean, easy-to-understand code
- **Complete implementation** - NO todos, placeholders, or missing pieces
- **Be honest about limitations** - If uncertain or don't know something, say so explicitly

#### General Code Quality
- **NO Object-Oriented Programming**: Avoid classes, inheritance, and OOP patterns. Always prefer functions and composition over classes and inheritance
- **Functional programming principles**: Use pure functions, immutable data structures, and function composition
- **Types instead interfaces**: Whenever possible use types instead of interfaces
- **Early returns**: Use early returns to reduce nesting and improve readability
- **Descriptive naming**: Use clear, self-documenting variable and function names
- **Event handlers**: Prefix with "handle" (e.g., `handleClick`, `handleKeyDown`)
- **Function declarations**: Use `const` arrow functions with explicit return types when possible
  ```typescript
  const calculateTotal = (items: ReadonlyArray<Item>): number => {
    // implementation
  }
  ```
**IMPORTANT: After completing any coding task, you MUST run the following command to ensure code quality:**

```bash
pnpm biome:check:fix       # Fix formatting and linting issues automatically
pnpm typecheck
```

Only mark tasks as complete after these checks pass successfully.