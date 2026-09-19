import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getPosts } from '@src/data/posts';
import { defaultCard, postPath, routes, type Card } from '@src/data/routes';
import { renderCard } from '@src/lib/og/card';
import { cardSize, cardSlug, postCrops } from '@src/lib/seo/meta';

const card = (slug: string, content: Card, size = cardSize) => ({
  params: { slug },
  props: { content, size },
});

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return [
    ...Object.entries(routes).map(([path, route]) => card(cardSlug(path), route.card)),
    card('default', defaultCard),
    ...posts.flatMap(post => {
      const slug = cardSlug(postPath(post.id));
      const content = { kicker: 'writing', headline: post.data.title };
      return [
        card(slug, content),
        ...Object.entries(postCrops).map(([crop, size]) => card(`${slug}-${crop}`, content, size)),
      ];
    }),
  ];
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props }) =>
  new Response(await renderCard(props.content, props.size), {
    headers: { 'Content-Type': 'image/png' },
  });
