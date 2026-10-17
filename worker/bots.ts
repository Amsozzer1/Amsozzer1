// Named crawlers, unfurlers and HTTP clients. Unfurlers matter most: they fire when
// a URL is pasted into a chat or a post, so they look exactly like somebody opening
// the link.
const MARKERS = [
  'bot',
  'crawl',
  'spider',
  'slurp',
  'scrape',
  'fetcher',
  'monitor',
  'research',
  'spy',
  'preview',
  'headless',
  'phantom',
  'curl',
  'wget',
  'python',
  'okhttp',
  'go-http',
  'httpclient',
  'libwww',
  'axios',
  'node-fetch',
  'ruby',
  'java/',
  'facebookexternalhit',
  'whatsapp',
  'telegram',
  'feed',
  'rss',
];

// A real browser always announces an engine. Anything that names none of these is a
// script, whatever else it claims: the ones seen here include TekaNewsAI, HNgine,
// SaaSSpyResearch and a bare "Mozilla/5.0" with nothing after it.
const ENGINES = ['chrome/', 'firefox/', 'safari/', 'edg/', 'opr/', 'version/'];

// Chrome updates itself, so a real visitor is within a few releases of stable. Scrapers
// pin an old build and never move: in October 2026 people arriving from Google,
// LinkedIn and GitHub were on 131 and up, while 120–129 came almost entirely from
// backlink-spam referrers. Keep this about two years behind stable and raise it
// once a year, together with migrations/0005_bot_backfill.sql.
const OLDEST_CHROME = 130;

const chromeMajor = (ua: string) => {
  const match = /chrome\/(\d+)/.exec(ua);
  return match ? Number(match[1]) : null;
};

export const isBot = (userAgent: string | null | undefined) => {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();
  if (MARKERS.some(marker => ua.includes(marker))) return true;

  const chrome = chromeMajor(ua);
  if (chrome !== null && chrome < OLDEST_CHROME) return true;

  return !ENGINES.some(engine => ua.includes(engine));
};
