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

export const isBot = (userAgent: string | null | undefined) => {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();
  if (MARKERS.some(marker => ua.includes(marker))) return true;

  return !ENGINES.some(engine => ua.includes(engine));
};
