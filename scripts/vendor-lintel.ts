import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = 'https://github.com/Amsozzer1/lintel';
const ROOT = 'public/lintel';

const commit = process.argv[2];
if (!commit || !/^[0-9a-f]{40}$/.test(commit)) {
  process.stderr.write('usage: pnpm vendor:lintel <full lintel commit sha>\n');
  process.exit(2);
}

const checkout = mkdtempSync(join(tmpdir(), 'lintel-'));
const run = (command: string, args: string[]) =>
  execFileSync(command, args, { cwd: checkout, stdio: ['ignore', 'ignore', 'inherit'] });

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );

try {
  // Built from a pinned commit rather than a release, so what ships is exactly that tree.
  run('git', ['init', '--quiet']);
  run('git', ['fetch', '--quiet', '--depth', '1', REPO, commit]);
  run('git', ['checkout', '--quiet', 'FETCH_HEAD']);
  run('pnpm', ['install', '--frozen-lockfile']);
  run('pnpm', ['playground:build']);

  rmSync(ROOT, { recursive: true, force: true });
  cpSync(join(checkout, 'playground/dist/lintel'), ROOT, { recursive: true });
} finally {
  rmSync(checkout, { recursive: true, force: true });
}

const shipped = files(ROOT);
const pglite = readdirSync(join(ROOT, 'pglite'))[0];

writeFileSync(
  'src/data/lintel.json',
  `${JSON.stringify(
    {
      commit,
      pglite,
      files: shipped.length,
      bytes: shipped.reduce((total, path) => total + statSync(path).size, 0),
      vendoredAt: new Date().toISOString().slice(0, 10),
    },
    null,
    2,
  )}\n`,
);
