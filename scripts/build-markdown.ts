import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import TurndownService from 'turndown';

const DIST = 'dist';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});

// Decoration carries nothing an agent can read.
turndown.remove(['script', 'style', 'noscript', 'canvas']);

const htmlFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
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
