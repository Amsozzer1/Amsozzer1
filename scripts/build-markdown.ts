import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import TurndownService from 'turndown';
import { routes, type Route } from '../src/data/routes.ts';

const DIST = 'dist';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});

// Decoration carries nothing an agent can read.
turndown.remove(['script', 'style', 'noscript', 'canvas']);

// A vendored app is not a page of the site: no prose for agents, so no markdown twin and no
// place in llms-full.txt.
const VENDORED = new Set([join(DIST, 'lintel')]);

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (VENDORED.has(path)) return [];
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });

const attribute = (tag: string, name: string) =>
  new RegExp(`${name}=["']([^"']*)["']`).exec(tag)?.[1];

const metaContent = (html: string, selector: RegExp) => {
  const tag = selector.exec(html)?.[0];
  return tag ? attribute(tag, 'content') : undefined;
};

const decode = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const yaml = (value: string) => `"${value.replace(/"/g, '\\"')}"`;

const markdown = (html: string) => {
  // Inline SVG is decoration here; turndown's remove() only takes HTML tag names, so it goes first.
  const main = (/<main[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1] ?? html).replace(
    /<svg[\s\S]*?<\/svg>/g,
    '',
  );
  const title = decode(/<title[^>]*>([\s\S]*?)<\/title>/.exec(html)?.[1].trim() ?? '');
  const description = metaContent(html, /<meta\s+name=["']description["'][^>]*>/);
  const canonical = attribute(/<link\s+rel=["']canonical["'][^>]*>/.exec(html)?.[0] ?? '', 'href');

  const frontMatter = [
    `title: ${yaml(title)}`,
    description && `description: ${yaml(decode(description))}`,
    canonical && `url: ${yaml(canonical)}`,
  ].filter(line => line !== undefined && line !== '');

  return `---\n${frontMatter.join('\n')}\n---\n\n${turndown.turndown(main).trim()}\n`;
};

// Two reasons a page stays out of llms-full.txt: it is noindexed, or it is a prototype that is
// indexable but isn't part of the body of work. Posts aren't routes, so anything unknown here is
// included. A hidden page still gets its markdown twin: the worker announces one on every page,
// and _headers noindexes every .md.
const hidden = new Set(
  Object.entries<Route>(routes)
    .filter(([, route]) => route.noindex === true || route.unlisted === true)
    .map(([path]) => path),
);

const written = htmlFiles(DIST).flatMap(file => {
  const body = markdown(readFileSync(file, 'utf8'));
  const target = `${file.slice(0, -'.html'.length)}.md`;
  writeFileSync(target, body);

  // A section index is written as <section>/index.md. The worker asks for <path>.md for every
  // page, so the same markdown is written under that name too.
  if (basename(target) === 'index.md' && dirname(target) !== DIST) {
    const alias = `${dirname(target)}.md`;
    writeFileSync(alias, body);
    return [relative(DIST, target), relative(DIST, alias)];
  }
  return [relative(DIST, target)];
});

// llms-full.txt: every page's markdown in one file, for clients that fetch the whole site at
// once rather than following llms.txt. Ordered so the pages that answer who and what come first.
const ORDER = ['index.md', 'about.md', 'experience.md', 'writing.md'];
const rank = (path: string) => {
  const index = ORDER.indexOf(path);
  return index === -1 ? ORDER.length : index;
};

const pages = written
  .filter(path => path !== '404.md' && !path.endsWith('/index.md'))
  .filter(path => !hidden.has(path === 'index.md' ? '/' : `/${path.slice(0, -'.md'.length)}`))
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

writeFileSync(
  join(DIST, 'llms-full.txt'),
  pages
    .map(path => readFileSync(join(DIST, path), 'utf8'))
    .join('\n---\n\n')
    .concat('\n'),
);

process.stdout.write(
  `markdown: ${written.length} file(s), ${pages.length} page(s) in llms-full.txt\n`,
);
