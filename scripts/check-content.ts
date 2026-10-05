import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TEXT = /\.(html|md|txt|json|xml)$/;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : TEXT.test(name) ? [path] : [];
  });

const patterns = (source: string, flags: string) =>
  source
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => new RegExp(line, flags));

const claims = patterns(readFileSync('scripts/retired-claims.txt', 'utf8'), 'i');
// Client and company names are never committed: the list lives in a repository secret.
const names = patterns(process.env.CONTENT_DENYLIST ?? '', 'u').map(
  name => new RegExp(`\\b${name.source}\\b`, 'u'),
);
const checkDashes = process.env.CHECK_EM_DASH === '1';

const resumeText = execFileSync('pdftotext', ['public/resume.pdf', '-'], { encoding: 'utf8' });
const files: [string, string][] = [
  ...walk('dist').map(path => [path, readFileSync(path, 'utf8')] as [string, string]),
  ['public/resume.pdf', resumeText],
  ['README.md', readFileSync('README.md', 'utf8')],
];

const prose = (path: string, text: string) =>
  path.endsWith('.md') || path === 'README.md'
    ? text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
    : '';

const failures = files.flatMap(([path, text]) => [
  ...[...claims, ...names].filter(pattern => pattern.test(text)).map(p => `${path}: ${p.source}`),
  ...(checkDashes && prose(path, text).includes('—') ? [`${path}: em dash`] : []),
]);

if (failures.length) {
  process.stdout.write(`Content check failed:\n${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Content check passed (${files.length} files).\n`);
