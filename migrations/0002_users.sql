-- Target database: cookmark-recipes (RECIPES binding).
-- Admins are promoted manually:
--   UPDATE users SET role = 'admin' WHERE email = '...';
CREATE TABLE IF NOT EXISTS users (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TEXT NOT NULL
);
