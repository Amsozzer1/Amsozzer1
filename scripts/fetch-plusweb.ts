import { execFileSync } from 'node:child_process';
import { mkdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const RELEASE = 'wasm-latest';
const REPO = 'Amsozzer1/PlusWeb';
const ROOT = 'public/demos/plusweb';
const FILES = ['plusweb.js', 'plusweb.wasm', 'plusweb.mjs'];

interface Version {
  version: string;
  commit: string;
  builtAt: string;
}

const staging = join(ROOT, 'staging');
const fileUrl = (name: string) => pathToFileURL(resolve(staging, name)).href;

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

execFileSync(
  'gh',
  [
    'release',
    'download',
    RELEASE,
    '--repo',
    REPO,
    '--dir',
    staging,
    ...FILES.flatMap(name => ['--pattern', name]),
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

// The version comes out of the module itself, so what gets recorded is what the vendored file
// reports rather than what the release claims.
const { loadPlusWeb } = (await import(fileUrl('plusweb.mjs'))) as {
  loadPlusWeb: (path: string) => Promise<{ version: () => Version }>;
};

const version = (await loadPlusWeb(fileUrl('plusweb.js'))).version();
const bytes = Object.fromEntries(FILES.map(name => [name, statSync(join(staging, name)).size]));

// A directory per build: the path changes whenever the module does, so everything inside it can be
// cached for a year without a visitor ever being handed a stale module.
const base = `/demos/plusweb/${version.commit}`;
renameSync(staging, join(ROOT, version.commit));

writeFileSync(
  'src/data/plusweb.json',
  `${JSON.stringify(
    { ...version, base, bytes, vendoredAt: new Date().toISOString().slice(0, 10) },
    null,
    2,
  )}\n`,
);

process.stdout.write(
  [
    `plusweb ${version.version} (${version.commit}) built ${version.builtAt}`,
    ...FILES.map(name => `  ${name.padEnd(13)} ${bytes[name]} bytes`),
    `  -> public${base}`,
  ].join('\n') + '\n',
);
