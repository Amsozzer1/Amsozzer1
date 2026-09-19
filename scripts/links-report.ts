import { execFileSync } from 'node:child_process';
import { companyBySlug } from '../worker/links.consts.ts';

interface Row {
  slug: string;
  visits: number;
  last_visit: string;
}

const PREVIEW_BOTS = [
  'LinkedInBot',
  'Slackbot',
  'Twitterbot',
  'facebookexternalhit',
  'Discordbot',
  'Googlebot',
  'bingbot',
];

const humansOnly = PREVIEW_BOTS.map(bot => `COALESCE(user_agent, '') NOT LIKE '%${bot}%'`);

const sql = `SELECT slug, COUNT(*) AS visits, MAX(visited_at) AS last_visit
FROM visits
WHERE ${humansOnly.join(' AND ')}
GROUP BY slug`;

// Reads the production database unless flags like --local are passed through.
const wranglerFlags = process.argv.slice(2);

const output = execFileSync(
  'wrangler',
  [
    'd1',
    'execute',
    'DB',
    '--json',
    '--command',
    sql,
    ...(wranglerFlags.length ? wranglerFlags : ['--remote']),
  ],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
);

const [{ results }] = JSON.parse(output) as [{ results: Row[] }];
const visitsBySlug = new Map(results.map(row => [row.slug, row]));

const lines = [...companyBySlug]
  .map(([slug, company]) => {
    const row = visitsBySlug.get(slug);
    return { company, slug, visits: row?.visits ?? 0, lastVisit: row?.last_visit ?? '-' };
  })
  .sort((a, b) => b.visits - a.visits)
  .map(
    ({ company, slug, visits, lastVisit }) =>
      `${company.padEnd(24)} /r/${slug.padEnd(20)} ${String(visits).padStart(6)}   ${lastVisit}`,
  );

process.stdout.write(
  [
    `${'company'.padEnd(24)} ${'link'.padEnd(23)} ${'visits'.padStart(6)}   last visit (UTC)`,
    ...lines,
  ]
    .join('\n')
    .concat('\n'),
);
