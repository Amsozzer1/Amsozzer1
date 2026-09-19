import { postModified, type Post } from '@src/data/posts';
import { postPath } from '@src/data/routes';
import { site } from '@src/data/site';
import { blogPosting } from '@src/lib/seo/graph';
import { breadcrumbsFor, cardAlt } from '@src/lib/seo/meta';
import type { PageSeo } from '@src/lib/seo/types';

export const postSeo = (post: Post): PageSeo => {
  const { title, description, tags } = post.data;
  const path = postPath(post.id);
  const published = post.data.pubDate.toISOString();
  const modified = postModified(post);
  return {
    title: `${title} · ${site.name}`,
    description,
    path,
    type: 'article',
    imageAlt: cardAlt(title),
    published,
    modified,
    breadcrumbs: breadcrumbsFor(path, title),
    graph: [blogPosting({ path, title, description, published, modified, tags })],
  };
};
