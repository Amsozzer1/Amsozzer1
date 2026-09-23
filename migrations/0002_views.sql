-- Page reads, not just tracked-link clicks. Same visitor hash as visits, so a click
-- on /r/<company> can be joined to whatever that person went on to read.
CREATE TABLE IF NOT EXISTS views (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
  country TEXT,
  referrer_host TEXT,
  user_agent TEXT,
  visitor TEXT
);

CREATE INDEX IF NOT EXISTS views_visitor ON views (visitor, viewed_at);
CREATE INDEX IF NOT EXISTS views_path ON views (path, viewed_at);
