import type { APIRoute } from 'astro';
import { absoluteUrl } from '@src/lib/seo/meta';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /r/

Sitemap: ${absoluteUrl('/sitemap.xml')}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
