import type { APIRoute } from 'astro';
import { absoluteUrl } from '@src/lib/seo/meta';

export const GET: APIRoute = () =>
  new Response(
    `# Content Signals: everything is allowed, training included. https://contentsignals.org
User-agent: *
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Allow: /
Disallow: /r/

Sitemap: ${absoluteUrl('/sitemap.xml')}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
