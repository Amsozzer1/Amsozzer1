import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const RELEASE = 'wasm-latest';
const REPO = 'Amsozzer1/PlusWeb';
const DIR = 'public/demos/plusweb';
const FILES = ['plusweb.js', 'plusweb.wasm', 'plusweb.mjs'];

interface Version {
  version: string;
  commit: string;
  builtAt: string;
}

const fileUrl = (name: string) => pathToFileURL(resolve(DIR, name)).href;

mkdirSync(DIR, { recursive: true });

execFileSync(
  'gh',
  [
    'release',
    'download',
    RELEASE,
    '--repo',
    REPO,
    '--dir',
    DIR,
    '--clobber',
    ...FILES.flatMap(name => ['--pattern', name]),
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

// The version is read out of the module itself, so what gets recorded is what
// the vendored file actually reports rather than what the release claims.
const { loadPlusWeb } = (await import(fileUrl('plusweb.mjs'))) as {
  loadPlusWeb: (path: string) => Promise<{ version: () => Version }>;
};

const version = (await loadPlusWeb(fileUrl('plusweb.js'))).version();
const bytes = Object.fromEntries(FILES.map(name => [name, statSync(join(DIR, name)).size]));

writeFileSync(
  'src/data/plusweb.json',
  `${JSON.stringify({ ...version, bytes, vendoredAt: new Date().toISOString().slice(0, 10) }, null, 2)}\n`,
);

process.stdout.write(
  [
    `plusweb ${version.version} (${version.commit}) built ${version.builtAt}`,
    ...FILES.map(name => `  ${name.padEnd(13)} ${bytes[name]} bytes`),
  ].join('\n') + '\n',
);
