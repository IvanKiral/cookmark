-- Target database: cookmark-recipes (RECIPES binding).
-- Admin-only "To delete" mark. The recipe is kept; this only highlights it.
-- Same rule as 0005: write with UPDATE, never INSERT OR REPLACE.
ALTER TABLE recipes ADD COLUMN should_delete INTEGER NOT NULL DEFAULT 0;
