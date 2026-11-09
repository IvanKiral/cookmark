-- Target database: cookmark-recipes (RECIPES binding). Requires 0005.
-- One admin verdict per recipe, from best to worst: Chef's kiss, Chef approved,
-- Chef's ok, Chef's flop. Replaces is_chef_pick: existing picks become Chef's
-- kiss and the app no longer reads or writes that column. It stays in place so
-- the version deployed before this one keeps working until the new one is live.
-- Same rule as 0005: write with UPDATE, never INSERT OR REPLACE.
ALTER TABLE recipes ADD COLUMN verdict TEXT
  CHECK (verdict IN ('chef-kiss', 'chef-approved', 'chef-ok', 'chef-flop'));

UPDATE recipes SET verdict = 'chef-kiss' WHERE is_chef_pick = 1;
