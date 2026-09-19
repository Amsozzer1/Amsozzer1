import type { APIRoute } from 'astro';
import { getPosts } from '@src/data/posts';
import { postPath, routes } from '@src/data/routes';
import { lastModified } from '@src/lib/dates';
import { absoluteUrl } from '@src/lib/seo/meta';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const pages = [
    ...Object.entries(routes).map(([path, route]) => ({
      path,
      lastmod: lastModified(...route.sources),
    })),
    ...posts.map(post => ({
      path: postPath(post.id),
      lastmod: lastModified(post.filePath ?? 'src/content/writing'),
    })),
  ];
  const urls = pages.map(
    ({ path, lastmod }) =>
      `<url><loc>${absoluteUrl(path)}</loc><lastmod>${lastmod}</lastmod></url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
