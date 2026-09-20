import type { APIRoute } from 'astro';
import { site } from '@src/data/site';
import { colors } from '@src/design/tokens';

// Generated rather than hand-written: the static copy drifted when the job title changed.
export const GET: APIRoute = () =>
  new Response(
    `${JSON.stringify(
      {
        name: `${site.name} — ${site.jobTitle}`,
        short_name: site.name,
        description: site.description,
        lang: site.language,
        start_url: '/',
        scope: '/',
        display: 'browser',
        background_color: colors.groundPaper,
        theme_color: colors.groundPaper,
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      null,
      2,
    )}\n`,
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
