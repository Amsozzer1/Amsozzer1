-- Bot classification, stored so a glance at the table in the dashboard is honest
-- without re-deriving it. The rules mirror worker/bots.ts; regenerate this file if
-- that list changes, and re-run the backfill.
ALTER TABLE visits ADD COLUMN is_bot INTEGER;
ALTER TABLE views ADD COLUMN is_bot INTEGER;

UPDATE visits SET is_bot = CASE
      WHEN user_agent IS NULL THEN 1
      WHEN instr(lower(user_agent), 'bot') > 0 THEN 1
      WHEN instr(lower(user_agent), 'crawl') > 0 THEN 1
      WHEN instr(lower(user_agent), 'spider') > 0 THEN 1
      WHEN instr(lower(user_agent), 'slurp') > 0 THEN 1
      WHEN instr(lower(user_agent), 'scrape') > 0 THEN 1
      WHEN instr(lower(user_agent), 'fetcher') > 0 THEN 1
      WHEN instr(lower(user_agent), 'monitor') > 0 THEN 1
      WHEN instr(lower(user_agent), 'research') > 0 THEN 1
      WHEN instr(lower(user_agent), 'spy') > 0 THEN 1
      WHEN instr(lower(user_agent), 'preview') > 0 THEN 1
      WHEN instr(lower(user_agent), 'headless') > 0 THEN 1
      WHEN instr(lower(user_agent), 'phantom') > 0 THEN 1
      WHEN instr(lower(user_agent), 'curl') > 0 THEN 1
      WHEN instr(lower(user_agent), 'wget') > 0 THEN 1
      WHEN instr(lower(user_agent), 'python') > 0 THEN 1
      WHEN instr(lower(user_agent), 'okhttp') > 0 THEN 1
      WHEN instr(lower(user_agent), 'go-http') > 0 THEN 1
      WHEN instr(lower(user_agent), 'httpclient') > 0 THEN 1
      WHEN instr(lower(user_agent), 'libwww') > 0 THEN 1
      WHEN instr(lower(user_agent), 'axios') > 0 THEN 1
      WHEN instr(lower(user_agent), 'node-fetch') > 0 THEN 1
      WHEN instr(lower(user_agent), 'ruby') > 0 THEN 1
      WHEN instr(lower(user_agent), 'java/') > 0 THEN 1
      WHEN instr(lower(user_agent), 'facebookexternalhit') > 0 THEN 1
      WHEN instr(lower(user_agent), 'whatsapp') > 0 THEN 1
      WHEN instr(lower(user_agent), 'telegram') > 0 THEN 1
      WHEN instr(lower(user_agent), 'feed') > 0 THEN 1
      WHEN instr(lower(user_agent), 'rss') > 0 THEN 1
      WHEN instr(lower(user_agent), 'chrome/') = 0 AND instr(lower(user_agent), 'firefox/') = 0 AND instr(lower(user_agent), 'safari/') = 0 AND instr(lower(user_agent), 'edg/') = 0 AND instr(lower(user_agent), 'opr/') = 0 AND instr(lower(user_agent), 'version/') = 0 THEN 1
      ELSE 0
    END;

UPDATE views SET is_bot = CASE
      WHEN user_agent IS NULL THEN 1
      WHEN instr(lower(user_agent), 'bot') > 0 THEN 1
      WHEN instr(lower(user_agent), 'crawl') > 0 THEN 1
      WHEN instr(lower(user_agent), 'spider') > 0 THEN 1
      WHEN instr(lower(user_agent), 'slurp') > 0 THEN 1
      WHEN instr(lower(user_agent), 'scrape') > 0 THEN 1
      WHEN instr(lower(user_agent), 'fetcher') > 0 THEN 1
      WHEN instr(lower(user_agent), 'monitor') > 0 THEN 1
      WHEN instr(lower(user_agent), 'research') > 0 THEN 1
      WHEN instr(lower(user_agent), 'spy') > 0 THEN 1
      WHEN instr(lower(user_agent), 'preview') > 0 THEN 1
      WHEN instr(lower(user_agent), 'headless') > 0 THEN 1
      WHEN instr(lower(user_agent), 'phantom') > 0 THEN 1
      WHEN instr(lower(user_agent), 'curl') > 0 THEN 1
      WHEN instr(lower(user_agent), 'wget') > 0 THEN 1
      WHEN instr(lower(user_agent), 'python') > 0 THEN 1
      WHEN instr(lower(user_agent), 'okhttp') > 0 THEN 1
      WHEN instr(lower(user_agent), 'go-http') > 0 THEN 1
      WHEN instr(lower(user_agent), 'httpclient') > 0 THEN 1
      WHEN instr(lower(user_agent), 'libwww') > 0 THEN 1
      WHEN instr(lower(user_agent), 'axios') > 0 THEN 1
      WHEN instr(lower(user_agent), 'node-fetch') > 0 THEN 1
      WHEN instr(lower(user_agent), 'ruby') > 0 THEN 1
      WHEN instr(lower(user_agent), 'java/') > 0 THEN 1
      WHEN instr(lower(user_agent), 'facebookexternalhit') > 0 THEN 1
      WHEN instr(lower(user_agent), 'whatsapp') > 0 THEN 1
      WHEN instr(lower(user_agent), 'telegram') > 0 THEN 1
      WHEN instr(lower(user_agent), 'feed') > 0 THEN 1
      WHEN instr(lower(user_agent), 'rss') > 0 THEN 1
      WHEN instr(lower(user_agent), 'chrome/') = 0 AND instr(lower(user_agent), 'firefox/') = 0 AND instr(lower(user_agent), 'safari/') = 0 AND instr(lower(user_agent), 'edg/') = 0 AND instr(lower(user_agent), 'opr/') = 0 AND instr(lower(user_agent), 'version/') = 0 THEN 1
      ELSE 0
    END;

CREATE INDEX IF NOT EXISTS visits_is_bot ON visits (is_bot, visited_at);
CREATE INDEX IF NOT EXISTS views_is_bot ON views (is_bot, viewed_at);
