import { isBot } from './bots.ts';
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
      'INSERT INTO visits (slug, country, referrer_host, user_agent, visitor, is_bot) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      slug,
      request.cf?.country ?? null,
      referrerHost(request),
      request.headers.get('User-Agent'),
      await fingerprint(request, salt),
      isBot(request.headers.get('User-Agent')) ? 1 : 0,
    )
    .run();
};

// A destination is only ever a path on this site. A scheme, a protocol-relative host or a
// backslash would turn /r/ into an open redirect, so anything that is not a plain path falls
// back to the home page.
const safePath = (value: unknown) =>
  typeof value === 'string' && /^\/[^/\\\s]/.test(value) && !value.includes('://') ? value : '/';

// One primary-key lookup, awaited because the redirect cannot be written without it. A link
// whose row is missing or unreadable still has to go somewhere.
const destinationFor = async (db: D1Database, slug: string) => {
  try {
    const row = await db.prepare('SELECT destination FROM links WHERE slug = ?').bind(slug).first();
    return safePath(row?.destination);
  } catch {
    return '/';
  }
};

const redirect = (location: string) =>
  new Response(null, {
    status: 302,
    headers: { Location: location, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });

export const handleLink = async (
  request: IncomingRequest,
  db: D1Database,
  salt: string | undefined,
  ctx: ExecutionContext,
) => {
  const slug = new URL(request.url).pathname.slice(PREFIX.length).replace(/\/$/, '').toLowerCase();

  if (!SLUG.test(slug)) return redirect('/');

  ctx.waitUntil(recordVisit(db, slug, request, salt));
  return redirect(await destinationFor(db, slug));
};
