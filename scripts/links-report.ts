import { execFileSync } from 'node:child_process';

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

const lines = results
  .sort((a, b) => b.visits - a.visits)
  .map(
    ({ slug, visits, last_visit }) =>
      `/r/${slug.padEnd(24)} ${String(visits).padStart(6)}   ${last_visit}`,
  );

process.stdout.write(
  [
    `${'link'.padEnd(28)} ${'visits'.padStart(6)}   last visit (UTC)`,
    ...(lines.length ? lines : ['no visits recorded yet']),
  ]
    .join('\n')
    .concat('\n'),
);
