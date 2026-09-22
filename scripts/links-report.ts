import { execFileSync } from 'node:child_process';

interface VisitRow {
  slug: string;
  visited_at: string;
  country: string | null;
  referrer_host: string | null;
  user_agent: string | null;
  visitor: string | null;
}

interface LinkRow {
  slug: string;
  company: string;
  company_type: string | null;
  channel: string | null;
  sent_at: string | null;
}

// Link unfurlers. These fire when a URL is pasted into a chat or a post, so they
// look exactly like an open and are the single biggest source of false positives.
const PREVIEW_BOTS = [
  'LinkedInBot',
  'Slackbot',
  'Twitterbot',
  'facebookexternalhit',
  'Discordbot',
  'Googlebot',
  'bingbot',
  'WhatsApp',
  'TelegramBot',
  'Applebot',
  'curl',
  'python-requests',
  'HeadlessChrome',
];

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

const isBot = (ua: string | null) =>
  !ua || PREVIEW_BOTS.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));

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

const flags = process.argv.slice(2).filter(argument => argument !== '--me');
const wranglerFlags = flags.length ? flags : ['--remote'];

// Your own visits are data, not noise, so they are labelled rather than dropped.
const selfVisitor = process.argv.includes('--me')
  ? (process.argv[process.argv.indexOf('--me') + 1] ?? '')
  : '';

const visits = query<VisitRow>(
  'SELECT slug, visited_at, country, referrer_host, user_agent, visitor FROM visits ORDER BY visited_at',
  wranglerFlags,
);
const links = query<LinkRow>(
  'SELECT slug, company, company_type, channel, sent_at FROM links',
  wranglerFlags,
);

const linkBySlug = new Map(links.map(link => [link.slug, link]));
const slugs = [...new Set([...visits.map(visit => visit.slug), ...linkBySlug.keys()])];

const rows = slugs
  .map(slug => {
    const all = visits.filter(visit => visit.slug === slug);
    const real = all.filter(visit => !isBot(visit.user_agent) && visit.visitor !== selfVisitor);
    const people = new Set(real.map(visit => visit.visitor ?? visit.user_agent));
    const days = new Set(real.map(visit => day(visit.visited_at)));
    const link = linkBySlug.get(slug);

    return {
      slug,
      company: link?.company ?? '',
      channel: link?.channel ?? '',
      type: link?.company_type ?? '',
      bots: all.length - real.length,
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
    `${'link'.padEnd(20)}${'company'.padEnd(17)}${'opens'.padStart(5)}${'people'.padStart(7)}${'bots'.padStart(5)}${'to 1st'.padStart(8)}  flags`,
    ...(table.length ? table : ['  nothing recorded yet']),
    '',
    'R = came back on another day   M = more than one person   A = clicked from an ATS',
    '',
    `${tracked.length} links tracked, ${opened.length} opened by a human (${pct(opened.length, tracked.length)})`,
    `${timed.length} have a recorded send time, so the rest cannot show time-to-first-open`,
    ...(group('channel').length ? ['', 'by channel', ...group('channel')] : []),
    ...(group('type').length ? ['', 'by company type', ...group('type')] : []),
    '',
  ].join('\n'),
);
