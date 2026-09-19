import type { APIRoute } from 'astro';
import { site } from '@src/data/site';
import { absoluteUrl } from '@src/lib/seo/meta';

const DAYS_VALID = 180;

export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + DAYS_VALID * 24 * 60 * 60 * 1000);
  return new Response(
    `Contact: mailto:${site.email}
Expires: ${expires.toISOString()}
Preferred-Languages: ${site.language}
Canonical: ${absoluteUrl('/.well-known/security.txt')}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
