import { execFileSync } from 'node:child_process';

import { isBot } from '../worker/bots.ts';

// Ticks "Link opened" in the Notion tracker for links a real person opened.
//
// Real means: not a preview bot, not you, and not a link checker. That last one
// matters most. Pasting a URL into LinkedIn or an ATS makes something fetch it
// within seconds, and those fetches send a browser user agent, so the only thing
// separating them from a person is that nobody reads a message that fast.

interface VisitRow {
  slug: string;
  visited_at: string;
  user_agent: string | null;
  visitor: string | null;
  is_bot: number | null;
}

interface NotionPage {
  id: string;
  properties: Record<string, { checkbox?: boolean; rich_text?: { plain_text: string }[] }>;
}

// Below this, a fetch that follows a bot's is the same automation, not a reader.
const CHECKER_WINDOW_SECONDS = 60;

const seconds = (from: string, to: string) =>
  (Date.parse(`${to}Z`) - Date.parse(`${from}Z`)) / 1000;

const token = process.env.NOTION_TOKEN;
const database = process.env.NOTION_DB;

if (!token || !database) {
  process.stdout.write(
    'NOTION_TOKEN and NOTION_DB are required.\n' +
      '  1. Create an integration at https://www.notion.so/my-integrations\n' +
      '  2. Open the Job Search database, ... menu, Connections, add it\n' +
      '  3. NOTION_DB is the id in the database URL\n',
  );
  process.exit(1);
}

const notion = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`);
  return response.json() as Promise<Record<string, unknown>>;
};

const visits = JSON.parse(
  execFileSync(
    'wrangler',
    [
      'd1',
      'execute',
      'DB',
      '--json',
      '--remote',
      '--command',
      'SELECT slug, visited_at, user_agent, visitor, is_bot FROM visits ORDER BY visited_at',
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  ),
)[0].results as VisitRow[];

const self = process.env.LINKS_ME ?? '';
const robot = (row: VisitRow) => (row.is_bot === null ? isBot(row.user_agent) : row.is_bot === 1);

// A slug counts as opened when a human hit is not trailing a bot hit on its heels.
const opened = new Set<string>();
for (const slug of new Set(visits.map(visit => visit.slug))) {
  const forSlug = visits.filter(visit => visit.slug === slug);
  const botTimes = forSlug.filter(robot).map(visit => visit.visited_at);

  const byPerson = forSlug.some(visit => {
    if (robot(visit) || (self && visit.visitor === self)) return false;
    return !botTimes.some(
      time =>
        seconds(time, visit.visited_at) >= 0 &&
        seconds(time, visit.visited_at) < CHECKER_WINDOW_SECONDS,
    );
  });

  if (byPerson) opened.add(slug);
}

const pages: NotionPage[] = [];
let cursor: string | undefined;
do {
  const page = await notion(`databases/${database}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
  });
  pages.push(...(page.results as NotionPage[]));
  cursor = page.has_more ? (page.next_cursor as string) : undefined;
} while (cursor);

let ticked = 0;
for (const page of pages) {
  const slug = page.properties['Tracking slug']?.rich_text?.[0]?.plain_text?.trim();
  if (!slug || !opened.has(slug) || page.properties['Link opened']?.checkbox) continue;

  await notion(`pages/${page.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties: { 'Link opened': { checkbox: true } } }),
  });
  process.stdout.write(`  ticked ${slug}\n`);
  ticked += 1;
}

const unknown = [...opened].filter(
  slug =>
    !pages.some(
      page => page.properties['Tracking slug']?.rich_text?.[0]?.plain_text?.trim() === slug,
    ),
);

process.stdout.write(
  `${opened.size} slugs opened by a person, ${ticked} newly ticked in Notion\n` +
    (unknown.length ? `no Notion row for: ${unknown.join(', ')}\n` : ''),
);
