import { defaultCard, findRoute, routes, type RoutePath } from '@src/data/routes';
import { site } from '@src/data/site';
import type { Breadcrumb, PageSeo } from '@src/lib/seo/types';

export const cardSize = { width: 1200, height: 630 };

export const postCrops = {
  '16x9': { width: 1200, height: 675 },
  '4x3': { width: 1200, height: 900 },
  '1x1': { width: 1200, height: 1200 },
};

export const absoluteUrl = (path: string) => new URL(path, site.url).href;

export const cardSlug = (path: string) => (path === '/' ? 'index' : path.slice(1));

export const cardPath = (path: string) => `/og/${cardSlug(path)}.png`;

export const cardAlt = (headline: string) => `“${headline}” — ${site.name}, ${site.role}`;

export const ogImage = (seo: PageSeo) => {
  const route = findRoute(seo.path);
  const hasCard = route !== undefined || seo.path.startsWith('/writing/');
  const path = seo.image ?? cardPath(hasCard ? seo.path : '/default');
  const alt = seo.imageAlt ?? cardAlt(route?.card.headline ?? defaultCard.headline);
  return { url: absoluteUrl(path), alt, ...cardSize };
};

const sections: Record<string, Breadcrumb> = {
  projects: { name: 'Projects', path: '/#projects' },
  writing: { name: 'Writing', path: '/writing' },
};

export const breadcrumbsFor = (path: string, name: string): Breadcrumb[] => {
  const [section = '', ...rest] = path.split('/').filter(Boolean);
  const parent = rest.length > 0 ? sections[section] : undefined;
  return [{ name: 'Home', path: '/' }, ...(parent ? [parent] : []), { name, path }];
};

export const routeSeo = (path: RoutePath): PageSeo => ({
  title: routes[path].title,
  description: routes[path].description,
  path,
  type: path === '/' ? 'profile' : 'website',
});
