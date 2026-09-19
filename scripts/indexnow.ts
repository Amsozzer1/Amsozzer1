import { readFileSync } from 'node:fs';

// @TODO: generate an IndexNow key and add public/<key>.txt
const key = process.env.INDEXNOW_KEY;
if (!key) throw new Error('INDEXNOW_KEY is not set.');

const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(.+?)<\/loc>/g)].map(([, loc]) => loc);
if (!urlList.length) throw new Error('dist/sitemap.xml lists no URLs. Run pnpm build first.');

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(urlList[0]).host, key, urlList }),
});

if (!response.ok) throw new Error(`IndexNow answered ${response.status}: ${await response.text()}`);

process.stdout.write(`IndexNow accepted ${urlList.length} URLs (${response.status}).\n`);
