import { fingerprint, referrerHost, type IncomingRequest } from './visitor.ts';

const PREFIX = '/r/';
const SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/;

const recordVisit = async (
  db: D1Database,
  slug: string,
  request: IncomingRequest,
  salt: string | undefined,
) => {
  await db
    .prepare(
      'INSERT INTO visits (slug, country, referrer_host, user_agent, visitor) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      slug,
      request.cf?.country ?? null,
      referrerHost(request),
      request.headers.get('User-Agent'),
      await fingerprint(request, salt),
    )
    .run();
};

export const handleLink = (
  request: IncomingRequest,
  db: D1Database,
  salt: string | undefined,
  ctx: ExecutionContext,
) => {
  const slug = new URL(request.url).pathname.slice(PREFIX.length).replace(/\/$/, '').toLowerCase();

  if (SLUG.test(slug)) ctx.waitUntil(recordVisit(db, slug, request, salt));

  // Every slug lands on the home page, so /r/ can never become an open redirect.
  return new Response(null, {
    status: 302,
    headers: { Location: '/', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
};
