-- Target database: cookmark-recipes (RECIPES binding). Requires 0002_users.sql.
-- slug deliberately has no foreign key to recipes, so re-importing a recipe
-- can never cascade-delete users' marks.
CREATE TABLE IF NOT EXISTS user_recipe_marks (
  email      TEXT NOT NULL REFERENCES users(email),
  slug       TEXT NOT NULL,
  mark       TEXT NOT NULL CHECK (mark IN ('favorite')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (email, slug, mark)
);
