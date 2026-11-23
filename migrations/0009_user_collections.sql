-- Target database: cookmark-recipes (RECIPES binding). Requires 0002_users.sql.
-- Per-user collections: manual ones hold an ordered list of recipes, smart
-- ones (shown as "smart filters") store list filters as JSON in `filters`.
-- Up to three collections per user are pinned (pin_position 1 to 3).
CREATE TABLE IF NOT EXISTS user_collections (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL REFERENCES users(email),
  name         TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('manual', 'smart')),
  filters      TEXT,
  pin_position INTEGER CHECK (pin_position BETWEEN 1 AND 3),
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_collections_name
  ON user_collections (email, name COLLATE NOCASE);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_collections_pin
  ON user_collections (email, pin_position) WHERE pin_position IS NOT NULL;

-- slug has no foreign key to recipes, like user_recipe_marks.
CREATE TABLE IF NOT EXISTS user_collection_recipes (
  collection_id TEXT NOT NULL,
  slug          TEXT NOT NULL,
  position      INTEGER NOT NULL,
  added_at      TEXT NOT NULL,
  PRIMARY KEY (collection_id, slug)
);
