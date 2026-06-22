CREATE TABLE IF NOT EXISTS recipe_inbox (
  id         INTEGER PRIMARY KEY,
  url        TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipe_inbox_status_created
  ON recipe_inbox (status, created_at);
