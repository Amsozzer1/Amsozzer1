import { isBot } from './bots.ts';
import { fingerprint, referrerHost, type IncomingRequest } from './visitor.ts';

// Pages and the résumé, nothing else. Assets never reach the Worker, but a markdown
// sibling or a HEAD probe would otherwise be counted as somebody reading the page.
const READABLE = ['text/html', 'application/pdf'];

const isRead = (request: IncomingRequest, response: Response) => {
  const type = response.headers.get('Content-Type') ?? '';
  return (
    request.method === 'GET' &&
    response.status === 200 &&
    READABLE.some(readable => type.includes(readable))
  );
};

export const recordView = async (
  db: D1Database,
  request: IncomingRequest,
  salt: string | undefined,
) => {
  const { pathname } = new URL(request.url);
  const visitor = await fingerprint(request, salt);

  const insert = db
    .prepare(
      'INSERT INTO views (path, country, referrer_host, user_agent, visitor, is_bot) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      pathname,
      request.cf?.country ?? null,
      referrerHost(request),
      request.headers.get('User-Agent'),
      visitor,
      isBot(request.headers.get('User-Agent')) ? 1 : 0,
    );

  if (!visitor) {
    await insert.run();
    return;
  }

  await db.batch([insert, markBurst(db, visitor)]);
};

// Some crawlers send a current, ordinary Chrome user agent, so the only thing that
// gives them away is pace: they pull the whole site in a few seconds. Nobody reads
// ten different pages in a minute, so once a visitor does, their last minute of
// rows is marked as a bot. The same rule backfilled history in 0005_bot_backfill.sql.
const BURST_PAGES = 10;

const markBurst = (db: D1Database, visitor: string) =>
  db
    .prepare(
      `UPDATE views SET is_bot = 1
       WHERE visitor = ?1 AND viewed_at >= datetime('now', '-60 seconds')
         AND (SELECT COUNT(DISTINCT path) FROM views
              WHERE visitor = ?1 AND viewed_at >= datetime('now', '-60 seconds')) >= ?2`,
    )
    .bind(visitor, BURST_PAGES);

// Logging happens after the response is built and is never awaited on the request
// path, so a slow or failing write cannot make a page slower or break it.
export const logRead = (
  request: IncomingRequest,
  response: Response,
  db: D1Database,
  salt: string | undefined,
  ctx: ExecutionContext,
) => {
  if (isRead(request, response)) {
    ctx.waitUntil(recordView(db, request, salt).catch(() => undefined));
  }

  return response;
};
