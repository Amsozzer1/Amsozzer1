import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts } from '@src/data/posts';
import { postPath, routes } from '@src/data/routes';
import { site } from '@src/data/site';
import { absoluteUrl } from '@src/lib/seo/meta';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  return rss({
    title: `${site.name} — Writing`,
    description: routes['/writing'].description,
    site: site.url,
    trailingSlash: false,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${site.language}</language><atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>`,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post.id),
      categories: post.data.tags,
      content: post.rendered?.html,
    })),
  });
};
