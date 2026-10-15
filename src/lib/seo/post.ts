import { postModified, type Post } from '@src/data/posts';
import { postPath } from '@src/data/routes';
import { site } from '@src/data/site';
import { blogPosting } from '@src/lib/seo/graph';
import { breadcrumbsFor, cardAlt } from '@src/lib/seo/meta';
import type { PageSeo } from '@src/lib/seo/types';

// html-validate's long-title limit. A long headline keeps its words and drops the site name.
const TITLE_MAX = 70;

export const postSeo = (post: Post): PageSeo => {
  const { title, description, tags } = post.data;
  const path = postPath(post.id);
  const published = post.data.pubDate.toISOString();
  const modified = postModified(post);
  const titled = `${title} · ${site.name}`;
  return {
    title: titled.length > TITLE_MAX ? title : titled,
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
