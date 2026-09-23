import re, pathlib
src = pathlib.Path('worker/bots.ts').read_text()
def block(name):
    body = re.search(rf'const {name} = \[(.*?)\];', src, re.S).group(1)
    return re.findall(r"'([^']+)'", body)
markers, engines = block('MARKERS'), block('ENGINES')

# The CASE mirrors worker/bots.ts exactly: markers first, then "names no engine".
marker_sql = '\n'.join(f"      WHEN instr(lower(user_agent), '{m}') > 0 THEN 1" for m in markers)
engine_sql = ' AND '.join(f"instr(lower(user_agent), '{e}') = 0" for e in engines)

case = f"""CASE
      WHEN user_agent IS NULL THEN 1
{marker_sql}
      WHEN {engine_sql} THEN 1
      ELSE 0
    END"""

sql = f"""-- Bot classification, stored so a glance at the table in the dashboard is honest
-- without re-deriving it. The rules mirror worker/bots.ts; regenerate this file if
-- that list changes, and re-run the backfill.
ALTER TABLE visits ADD COLUMN is_bot INTEGER;
ALTER TABLE views ADD COLUMN is_bot INTEGER;

UPDATE visits SET is_bot = {case};

UPDATE views SET is_bot = {case};

CREATE INDEX IF NOT EXISTS visits_is_bot ON visits (is_bot, visited_at);
CREATE INDEX IF NOT EXISTS views_is_bot ON views (is_bot, viewed_at);
"""
pathlib.Path('migrations/0003_is_bot.sql').write_text(sql)
print(f"{len(markers)} markers, {len(engines)} engines")
