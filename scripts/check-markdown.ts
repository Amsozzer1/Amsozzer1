import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { unstable_readConfig } from 'wrangler';
import { markdownPath } from '../worker/markdown.ts';

const DIST = 'dist';

// The worker announces a markdown twin on every HTML page it serves, and it only serves the
// paths in run_worker_first. Reading the list from wrangler keeps this check in step with it.
const runWorkerFirst = unstable_readConfig({ config: 'wrangler.jsonc' }).assets?.run_worker_first;

const glob = (pattern: string) =>
  new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);

const patterns = Array.isArray(runWorkerFirst) ? runWorkerFirst : [];
const included = patterns.filter(pattern => !pattern.startsWith('!')).map(glob);
const excluded = patterns.filter(pattern => pattern.startsWith('!')).map(p => glob(p.slice(1)));

const servedByWorker = (path: string) =>
  runWorkerFirst === true ||
  (included.some(pattern => pattern.test(path)) && !excluded.some(pattern => pattern.test(path)));

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });

const routePath = (file: string) => {
  const path = relative(DIST, file).slice(0, -'.html'.length);
  return path === 'index' ? '/' : `/${path.replace(/\/index$/, '')}`;
};

const announced = htmlFiles(DIST)
  .map(routePath)
  .filter(path => path !== '/404' && servedByWorker(path));

const missing = announced.filter(path => !existsSync(join(DIST, markdownPath(path))));

if (missing.length > 0) {
  process.stdout.write(
    `Markdown check failed: these pages announce a twin that was not built:\n${missing
      .map(path => `  ${path} -> ${markdownPath(path)}`)
      .join('\n')}\n`,
  );
  process.exit(1);
}
process.stdout.write(`Markdown check passed (${announced.length} pages).\n`);
