import type { APIRoute } from 'astro';
import { getPosts, postModified } from '@src/data/posts';
import { postPath, routes } from '@src/data/routes';
import { site } from '@src/data/site';
import { absoluteUrl, cardPath } from '@src/lib/seo/meta';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `${site.name} — Writing`,
    description: routes['/writing'].description,
    home_page_url: absoluteUrl('/writing'),
    feed_url: absoluteUrl('/feed.json'),
    language: site.language,
    authors: [{ name: site.name, url: site.url }],
    items: posts.map(post => ({
      id: absoluteUrl(postPath(post.id)),
      url: absoluteUrl(postPath(post.id)),
      title: post.data.title,
      summary: post.data.description,
      content_html: post.rendered?.html ?? '',
      image: absoluteUrl(cardPath(postPath(post.id))),
      date_published: post.data.pubDate.toISOString(),
      date_modified: postModified(post),
      tags: post.data.tags,
    })),
  };
  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
