-- The visits table predates this directory. It was created by hand, so 0001's
-- "ALTER TABLE visits" had nothing to alter on a fresh database and migrations/ could not
-- rebuild the schema from nothing. This is that table, written down, exactly as it exists
-- in production minus the columns 0001 and 0003 go on to add — so the chain replays in order.
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  visited_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT,
  referrer_host TEXT,
  user_agent TEXT
);
