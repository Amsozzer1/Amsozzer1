import { execFileSync } from 'node:child_process';

import { isBot } from '../worker/bots.ts';

interface ViewRow {
  path: string;
  viewed_at: string;
  visitor: string | null;
  user_agent: string | null;
  is_bot: number | null;
}

interface VisitRow {
  slug: string;
  visited_at: string;
  country: string | null;
  referrer_host: string | null;
  user_agent: string | null;
  visitor: string | null;
  is_bot: number | null;
}

interface LinkRow {
  slug: string;
  company: string;
  company_type: string | null;
  channel: string | null;
  sent_at: string | null;
}

// Applicant tracking systems. A referrer from one of these means somebody clicked
// while looking at the application itself, which is the strongest signal here.
const ATS = ['greenhouse', 'lever', 'ashby', 'workday', 'icims', 'smartrecruiters', 'jobvite'];

const query = <T>(sql: string, flags: string[]): T[] => {
  const output = execFileSync(
    'wrangler',
    ['d1', 'execute', 'DB', '--json', '--command', sql, ...flags],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  );
  const [{ results }] = JSON.parse(output) as [{ results: T[] }];
  return results;
};

const botRow = (row: { is_bot: number | null; user_agent: string | null }) =>
  row.is_bot === null ? isBot(row.user_agent) : row.is_bot === 1;

const fromAts = (referrer: string | null) =>
  !!referrer && ATS.some(host => referrer.toLowerCase().includes(host));

const day = (timestamp: string) => timestamp.slice(0, 10);

const hours = (from: string, to: string) =>
  (Date.parse(`${to}Z`) - Date.parse(`${from}Z`)) / 3_600_000;

const describe = (elapsed: number) =>
  elapsed < 1
    ? `${Math.round(elapsed * 60)}m`
    : elapsed < 48
      ? `${elapsed.toFixed(1)}h`
      : `${Math.round(elapsed / 24)}d`;

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '-');

const argv = process.argv.slice(2);
const me = argv.indexOf('--me');

// Your own visits are data, not noise, so they are labelled rather than dropped.
// LINKS_ME carries the hash when you would rather not type it every time.
const selfVisitor = me === -1 ? (process.env.LINKS_ME ?? '') : (argv[me + 1] ?? '');

// --me takes a value, so both it and the hash have to be kept away from wrangler.
const passthrough = argv.filter((_, index) => index !== me && index !== me + 1);
const wranglerFlags = passthrough.length ? passthrough : ['--remote'];

const visits = query<VisitRow>(
  'SELECT slug, visited_at, country, referrer_host, user_agent, visitor, is_bot FROM visits ORDER BY visited_at',
  wranglerFlags,
);
const links = query<LinkRow>(
  'SELECT slug, company, company_type, channel, sent_at FROM links',
  wranglerFlags,
);

const views = query<ViewRow>(
  'SELECT path, viewed_at, visitor, user_agent, is_bot FROM views ORDER BY viewed_at',
  wranglerFlags,
);

const linkBySlug = new Map(links.map(link => [link.slug, link]));
const slugs = [...new Set([...visits.map(visit => visit.slug), ...linkBySlug.keys()])];

const rows = slugs
  .map(slug => {
    const all = visits.filter(visit => visit.slug === slug);
    const bots = all.filter(botRow);
    // Yours are neither bot nor stranger, so they get counted on their own rather
    // than quietly inflating either column.
    const mine = all.filter(
      visit => !botRow(visit) && selfVisitor !== '' && visit.visitor === selfVisitor,
    );
    const real = all.filter(visit => !bots.includes(visit) && !mine.includes(visit));
    const people = new Set(real.map(visit => visit.visitor ?? visit.user_agent));
    const days = new Set(real.map(visit => day(visit.visited_at)));
    const link = linkBySlug.get(slug);

    return {
      slug,
      company: link?.company ?? '',
      channel: link?.channel ?? '',
      type: link?.company_type ?? '',
      bots: bots.length,
      mine: mine.length,
      opens: real.length,
      people: people.size,
      returned: days.size > 1,
      ats: real.some(visit => fromAts(visit.referrer_host)),
      first: real[0]?.visited_at,
      latency: link?.sent_at && real[0] ? hours(link.sent_at, real[0].visited_at) : undefined,
    };
  })
  .sort((a, b) => Number(b.ats) - Number(a.ats) || b.people - a.people || b.opens - a.opens);

const mark = (on: boolean, glyph: string) => (on ? glyph : ' ');

const table = rows.map(row =>
  [
    `/r/${row.slug}`.padEnd(20),
    (row.company || '-').slice(0, 16).padEnd(17),
    String(row.opens).padStart(5),
    String(row.people).padStart(7),
    String(row.mine).padStart(5),
    String(row.bots).padStart(5),
    (row.latency === undefined ? '-' : describe(row.latency)).padStart(8),
    `  ${mark(row.returned, 'R')}${mark(row.people > 1, 'M')}${mark(row.ats, 'A')}`,
  ].join(''),
);

// Only links you actually recorded sending can have an open rate. Counting every
// slug that ever got a hit against every slug in the table mixes in test links and
// flatters the number.
const tracked = rows.filter(row => linkBySlug.has(row.slug));
const opened = tracked.filter(row => row.opens > 0);
const timed = tracked.filter(row => row.latency !== undefined);

// What people read, and what a tracked click led to. Bots are excluded here rather
// than shown, because a crawler sweeping every page tells you nothing about a reader.
const humanViews = views.filter(view => !botRow(view) && view.visitor !== selfVisitor);
const byPath = [...new Set(humanViews.map(view => view.path))]
  .map(path => {
    const seen = humanViews.filter(view => view.path === path);
    return { path, reads: seen.length, people: new Set(seen.map(view => view.visitor)).size };
  })
  .sort((a, b) => b.people - a.people || b.reads - a.reads);

const clickers = new Set(
  visits.filter(visit => !botRow(visit) && visit.visitor).map(visit => visit.visitor),
);
const followed = humanViews.filter(view => clickers.has(view.visitor));

const group = (key: 'channel' | 'type') => {
  const names = [...new Set(rows.map(row => row[key]).filter(Boolean))];
  return names.map(name => {
    const inGroup = rows.filter(row => row[key] === name);
    const hit = inGroup.filter(row => row.opens > 0).length;
    return `  ${name.padEnd(18)} ${String(hit).padStart(3)}/${String(inGroup.length).padEnd(3)}  ${pct(hit, inGroup.length)}`;
  });
};

process.stdout.write(
  [
    `${'link'.padEnd(20)}${'company'.padEnd(17)}${'opens'.padStart(5)}${'people'.padStart(7)}${'you'.padStart(5)}${'bots'.padStart(5)}${'to 1st'.padStart(8)}  flags`,
    ...(table.length ? table : ['  nothing recorded yet']),
    '',
    'R = came back on another day   M = more than one person   A = clicked from an ATS',
    '',
    `${tracked.length} links tracked, ${opened.length} opened by a human (${pct(opened.length, tracked.length)})`,
    `${timed.length} have a recorded send time, so the rest cannot show time-to-first-open`,
    ...(group('channel').length ? ['', 'by channel', ...group('channel')] : []),
    ...(group('type').length ? ['', 'by company type', ...group('type')] : []),
    '',
    `pages read by people  ${humanViews.length} reads, ${new Set(humanViews.map(v => v.visitor)).size} readers, ${views.length - humanViews.length} bot hits ignored`,
    ...(byPath.length
      ? byPath.map(
          row =>
            `  ${row.path.padEnd(46)}${String(row.reads).padStart(5)}${String(row.people).padStart(8)}`,
        )
      : ['  nothing read yet']),
    ...(followed.length
      ? ['', `of those, ${followed.length} reads came from someone who had clicked a tracked link`]
      : []),
    '',
  ].join('\n'),
);
