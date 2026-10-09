-- Target database: cookmark-recipes (RECIPES binding).
-- Writes to recipes must use UPDATE, never INSERT OR REPLACE: a replace
-- deletes the row and would silently reset is_chef_pick to 0.
ALTER TABLE recipes ADD COLUMN is_chef_pick INTEGER NOT NULL DEFAULT 0;
