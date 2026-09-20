const PREFIX = '/r/';
const SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/;

type IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const recordVisit = (db: D1Database, slug: string, request: IncomingRequest) => {
  const referrer = request.headers.get('Referer');

  return db
    .prepare('INSERT INTO visits (slug, country, referrer_host, user_agent) VALUES (?, ?, ?, ?)')
    .bind(
      slug,
      request.cf?.country ?? null,
      referrer ? (URL.parse(referrer)?.host ?? null) : null,
      request.headers.get('User-Agent'),
    )
    .run();
};

export const handleLink = (request: IncomingRequest, db: D1Database, ctx: ExecutionContext) => {
  const slug = new URL(request.url).pathname.slice(PREFIX.length).replace(/\/$/, '').toLowerCase();

  if (SLUG.test(slug)) ctx.waitUntil(recordVisit(db, slug, request));

  // Every slug lands on the home page, so /r/ can never become an open redirect.
  return new Response(null, {
    status: 302,
    headers: { Location: '/', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
};
