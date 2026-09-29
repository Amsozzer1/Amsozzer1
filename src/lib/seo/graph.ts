import type {
  BlogPosting,
  BreadcrumbList,
  CollegeOrUniversity,
  EmployeeRole,
  Graph,
  Organization,
  Person,
  PersonLeaf,
  SoftwareSourceCode,
  WebPage,
  WebSite,
} from 'schema-dts';
import { projects, type Project } from '@src/data/projects';
import resume from '@src/data/resume.json';
import { findRoute, postPath } from '@src/data/routes';
import { site } from '@src/data/site';
import { lastModified } from '@src/lib/dates';
import { absoluteUrl, breadcrumbsFor, cardPath, postCrops } from '@src/lib/seo/meta';
import type { PageSeo } from '@src/lib/seo/types';

export const personId = `${site.url}/#person`;
export const websiteId = `${site.url}/#website`;

const pageId = (path: string) => `${absoluteUrl(path)}#webpage`;
const codeId = (path: string) => `${absoluteUrl(path)}#code`;
const articleId = (path: string) => `${absoluteUrl(path)}#article`;

// The project a post is about, so the two nodes can point at each other across pages.
const projectForPost = (path: string) =>
  projects.find(project => project.writing?.some(id => postPath(id) === path));

const organization = (name: string): Organization => ({ '@type': 'Organization', name });

const school: CollegeOrUniversity = {
  '@type': 'CollegeOrUniversity',
  name: site.school.name,
  url: site.school.url,
  sameAs: site.school.wikidata,
};

type Job = (typeof resume.work)[number];

const employeeRole = (job: Job): EmployeeRole => ({
  '@type': 'EmployeeRole',
  roleName: job.position,
  startDate: job.startDate,
  ...(job.endDate && { endDate: job.endDate }),
});

// Only the current job. schema.org says to express a past profession as a Role with an endDate,
// and that is valid, but consumers flatten worksFor and drop the qualifiers — so a finished job
// in there answers "where does he work?" with three employers. /experience carries the history
// as text, which is what extractors read anyway.
const workHistory = (): Pick<PersonLeaf, 'worksFor'> => ({
  worksFor: resume.work
    .filter(job => !job.endDate)
    .map(job => ({ ...employeeRole(job), worksFor: organization(job.name) })),
});

export const person = (): Person => ({
  '@type': 'Person',
  '@id': personId,
  name: site.name,
  alternateName: site.alternateNames,
  givenName: site.givenName,
  familyName: site.familyName,
  jobTitle: site.jobTitle,
  description: site.description,
  email: site.email,
  url: absoluteUrl('/'),
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  },
  ...workHistory(),
  alumniOf: school,
  knowsAbout: site.knowsAbout,
  sameAs: [site.links.github, site.links.linkedin, site.links.orcid],
  identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: site.orcid },
});

export const website = (): WebSite => ({
  '@type': 'WebSite',
  '@id': websiteId,
  url: absoluteUrl('/'),
  name: site.name,
  description: site.description,
  inLanguage: site.language,
  publisher: { '@id': personId },
});

export const webPage = (seo: PageSeo): WebPage => {
  const route = findRoute(seo.path);
  const common = {
    '@id': pageId(seo.path),
    url: absoluteUrl(seo.path),
    name: seo.title,
    description: seo.description,
    inLanguage: site.language,
    isPartOf: { '@id': websiteId },
    author: { '@id': personId },
    ...(seo.published && { datePublished: seo.published }),
    dateModified: seo.modified ?? lastModified(...(route?.sources ?? [])),
  };
  if (route?.schema === 'ProfilePage') {
    return { '@type': 'ProfilePage', ...common, mainEntity: { '@id': personId } };
  }
  if (route?.schema === 'CollectionPage') return { '@type': 'CollectionPage', ...common };
  return { '@type': 'WebPage', ...common };
};

export const breadcrumbList = (seo: PageSeo): BreadcrumbList => {
  const crumbs =
    seo.breadcrumbs ?? breadcrumbsFor(seo.path, findRoute(seo.path)?.name ?? seo.title);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(seo.path)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
};

// @TODO: add dateModified from each repo's latest release once the demos are vendored with a build-info.json
export const softwareSourceCode = (project: Project): SoftwareSourceCode => ({
  '@type': 'SoftwareSourceCode',
  '@id': codeId(project.path),
  name: project.name,
  description: project.tagline,
  url: absoluteUrl(project.path),
  codeRepository: project.repo,
  programmingLanguage: project.programmingLanguage,
  runtimePlatform: project.runtimePlatform,
  keywords: project.stack,
  ...(project.license && { license: `https://spdx.org/licenses/${project.license}.html` }),
  author: { '@id': personId },
  mainEntityOfPage: { '@id': pageId(project.path) },
  ...(project.registry && { sameAs: project.registry.url }),
  ...(project.writing?.length && {
    subjectOf: project.writing.map(id => ({ '@id': articleId(postPath(id)) })),
  }),
});

export interface PostSummary {
  path: string;
  title: string;
  description: string;
  published: string;
  modified: string;
  tags: string[];
}

export const blogPosting = (post: PostSummary): BlogPosting => ({
  '@type': 'BlogPosting',
  '@id': articleId(post.path),
  headline: post.title,
  description: post.description,
  url: absoluteUrl(post.path),
  datePublished: post.published,
  dateModified: post.modified,
  image: Object.keys(postCrops).map(crop => absoluteUrl(cardPath(`${post.path}-${crop}`))),
  keywords: post.tags,
  inLanguage: site.language,
  author: { '@id': personId },
  publisher: { '@id': personId },
  isPartOf: { '@id': websiteId },
  mainEntityOfPage: { '@id': pageId(post.path) },
  ...(() => {
    const project = projectForPost(post.path);
    return project ? { about: { '@id': codeId(project.path) } } : {};
  })(),
});

export const buildGraph = (seo: PageSeo): Graph => {
  const project = projects.find(item => item.path === seo.path);
  const isHome = seo.path === '/';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person(),
      // The site node rides on every page: each one is crawled on its own, and the
      // WebPage nodes point at it with isPartOf.
      website(),
      ...(isHome ? [] : [breadcrumbList(seo)]),
      webPage(seo),
      ...(project ? [softwareSourceCode(project)] : []),
      ...(seo.graph ?? []),
    ],
  };
};
