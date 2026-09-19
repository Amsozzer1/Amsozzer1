CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  visited_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT,
  referrer_host TEXT,
  user_agent TEXT
);
