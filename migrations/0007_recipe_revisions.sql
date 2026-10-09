-- Target database: cookmark-recipes (RECIPES binding).
-- One row per admin edit, holding the recipe JSON as it was *before* the edit,
-- so any edit can be undone by hand (see README). No foreign keys, so the
-- history survives if a user or a recipe is removed later.
CREATE TABLE IF NOT EXISTS recipe_revisions (
  id         INTEGER PRIMARY KEY,
  slug       TEXT NOT NULL,
  data       TEXT NOT NULL,
  edited_by  TEXT NOT NULL,
  edited_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipe_revisions_slug ON recipe_revisions (slug, id);
