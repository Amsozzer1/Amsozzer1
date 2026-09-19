import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

export const getPosts = async (): Promise<Post[]> =>
  (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

export const postModified = (post: Post) => (post.data.updated ?? post.data.pubDate).toISOString();
