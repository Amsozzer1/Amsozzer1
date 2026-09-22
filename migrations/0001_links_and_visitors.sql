-- Who opened it, approximately. A salted hash of IP and user agent: stable enough
-- to recognise the same person coming back, never reversible to an address.
ALTER TABLE visits ADD COLUMN visitor TEXT;

-- What was sent, to whom, and when. Without sent_at there is no time-to-first-open,
-- and without a row per link sent there is no denominator for an open rate.
CREATE TABLE IF NOT EXISTS links (
  slug TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  company_type TEXT,
  channel TEXT,
  sent_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS visits_slug_time ON visits (slug, visited_at);
CREATE INDEX IF NOT EXISTS visits_visitor ON visits (visitor);
