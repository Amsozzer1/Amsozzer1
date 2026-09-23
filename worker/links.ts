const PREFIX = '/r/';
const SLUG = /^[a-z0-9][a-z0-9-]{0,31}$/;

type IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Enough to tell one opener from another, not enough to identify anyone. The salt
// lives as a Worker secret, so the digest cannot be walked back to an address by
// anyone holding the database. Without a salt we store nothing rather than fall
// back to something guessable: this repository is public.
const fingerprint = async (request: IncomingRequest, salt: string | undefined) => {
  if (!salt) return null;

  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return null;

  const material = `${salt}:${ip}:${request.headers.get('User-Agent') ?? ''}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));

  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const recordVisit = async (
  db: D1Database,
  slug: string,
  request: IncomingRequest,
  salt: string | undefined,
) => {
  const referrer = request.headers.get('Referer');

  await db
    .prepare(
      'INSERT INTO visits (slug, country, referrer_host, user_agent, visitor) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      slug,
      request.cf?.country ?? null,
      referrer ? (URL.parse(referrer)?.host ?? null) : null,
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
