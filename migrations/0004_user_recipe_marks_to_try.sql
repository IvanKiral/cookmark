-- Target database: cookmark-recipes (RECIPES binding). Requires 0003.
-- Allows the 'to-try' mark. SQLite cannot alter a CHECK constraint, so the
-- table is rebuilt and its rows copied. Nothing references this table, so
-- dropping it does not trip any foreign key.
CREATE TABLE user_recipe_marks_new (
  email      TEXT NOT NULL REFERENCES users(email),
  slug       TEXT NOT NULL,
  mark       TEXT NOT NULL CHECK (mark IN ('favorite', 'to-try')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (email, slug, mark)
);

INSERT INTO user_recipe_marks_new (email, slug, mark, created_at)
  SELECT email, slug, mark, created_at FROM user_recipe_marks;

DROP TABLE user_recipe_marks;

ALTER TABLE user_recipe_marks_new RENAME TO user_recipe_marks;
