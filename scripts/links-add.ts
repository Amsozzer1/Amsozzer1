import { execFileSync } from 'node:child_process';

import { safePath } from '../worker/paths.ts';

// Recording a link by hand meant writing SQL, which meant sent_at usually never
// got written, which meant time-to-first-open could never be computed. This exists
// so the moment you send something is the moment it gets recorded.

const usage = `usage: pnpm links:add <slug> <company> [--to <path>] [--type <kind>] [--channel <how>] [--note <text>] [--local]

  pnpm links:add stripe Stripe --to /projects/plusweb --type big-co --channel application
  pnpm links:add acme "Acme Corp" --type startup --channel email --note "referred by Dana"

sent_at is set to now, because you run this when you send the link.
--to is where the link lands. Without it the visitor gets the home page, which is rarely
what the link was about.`;

const SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/;

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const at = argv.indexOf(`--${name}`);
  return at === -1 ? null : (argv[at + 1] ?? null);
};

const positional = argv.filter((value, index) => {
  if (value.startsWith('--')) return false;
  const previous = argv[index - 1];
  return !(previous?.startsWith('--') && previous !== '--local');
});

const [slug, company] = positional;

if (!slug || !company) {
  process.stdout.write(`${usage}\n`);
  process.exit(1);
}

if (!SLUG.test(slug)) {
  process.stdout.write(
    `"${slug}" cannot be a slug. Lowercase letters, digits and hyphens, 32 characters, starting with a letter or digit — the worker ignores anything else.\n`,
  );
  process.exit(1);
}

// The same predicate the worker redirects through, so a destination the CLI accepts cannot
// be one the worker quietly drops on the floor.
const destination = flag('to');
if (destination !== null && safePath(destination) !== destination) {
  process.stdout.write(
    `"${destination}" is not a path on the site. It has to start with a single /.\n`,
  );
  process.exit(1);
}

const quote = (value: string | null) =>
  value === null ? 'NULL' : `'${value.replace(/'/g, "''")}'`;

const sql = `INSERT INTO links (slug, company, company_type, channel, note, destination, sent_at)
VALUES (${quote(slug)}, ${quote(company)}, ${quote(flag('type'))}, ${quote(flag('channel'))}, ${quote(flag('note'))}, ${quote(destination)}, datetime('now'))
ON CONFLICT(slug) DO UPDATE SET
  company = excluded.company,
  company_type = COALESCE(excluded.company_type, links.company_type),
  channel = COALESCE(excluded.channel, links.channel),
  note = COALESCE(excluded.note, links.note),
  destination = COALESCE(excluded.destination, links.destination),
  sent_at = COALESCE(links.sent_at, excluded.sent_at)`;

execFileSync(
  'wrangler',
  ['d1', 'execute', 'DB', '--command', sql, argv.includes('--local') ? '--local' : '--remote'],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

process.stdout.write(
  `https://amsozzer.com/r/${slug}  ->  ${company}  lands on ${destination ?? '/'}\n`,
);
