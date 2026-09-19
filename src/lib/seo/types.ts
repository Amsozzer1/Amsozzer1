import type { Thing } from 'schema-dts';

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface PageSeo {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  breadcrumbs?: Breadcrumb[];
  published?: string;
  modified?: string;
  graph?: Thing[];
}
