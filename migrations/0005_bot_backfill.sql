-- Two rules worker/bots.ts and worker/views.ts now apply on write, run once over
-- the rows recorded before them. Both only ever flip is_bot to 1.

-- Chrome older than 130: scrapers pin an old build, real visitors auto-update.
UPDATE visits SET is_bot = 1
WHERE COALESCE(is_bot, 0) = 0
  AND instr(lower(user_agent), 'chrome/') > 0
  AND CAST(substr(user_agent, instr(lower(user_agent), 'chrome/') + 7) AS INTEGER) < 130;

UPDATE views SET is_bot = 1
WHERE COALESCE(is_bot, 0) = 0
  AND instr(lower(user_agent), 'chrome/') > 0
  AND CAST(substr(user_agent, instr(lower(user_agent), 'chrome/') + 7) AS INTEGER) < 130;

-- Ten or more different pages inside one minute: a crawler, whatever it claims to be.
UPDATE views SET is_bot = 1
WHERE COALESCE(is_bot, 0) = 0
  AND visitor IN (
    SELECT DISTINCT a.visitor FROM views a
    WHERE a.visitor IS NOT NULL
      AND (
        SELECT COUNT(DISTINCT b.path) FROM views b
        WHERE b.visitor = a.visitor
          AND b.viewed_at BETWEEN a.viewed_at AND datetime(a.viewed_at, '+60 seconds')
      ) >= 10
  );
