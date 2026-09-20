import type { APIRoute } from 'astro';
import { getPosts } from '@src/data/posts';
import { projects } from '@src/data/projects';
import { postPath, routes, type RoutePath } from '@src/data/routes';
import { site } from '@src/data/site';
import { absoluteUrl } from '@src/lib/seo/meta';

const link = (name: string, path: string, note: string) =>
  `- [${name}](${absoluteUrl(path)}): ${note}`;

const routeLink = (path: RoutePath) => link(routes[path].name, path, routes[path].description);

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.jobTitle} at ${site.employer.name}. Contact: ${site.email}.`,
    '',
    'Every page below is also available as markdown: send `Accept: text/markdown`, or add `.md` to the path. All of them concatenated: /llms-full.txt.',
    '',
    '## Experience',
    '',
    routeLink('/about'),
    routeLink('/experience'),
    link('Résumé (JSON Resume)', '/resume.json', 'the résumé as JSON Resume 1.3.1'),
    link('Résumé (PDF)', site.resumePdf, 'the same résumé as a PDF'),
    '',
    '## Projects',
    '',
    ...projects.map(project =>
      link(project.name, project.path, `${project.tagline} Source: ${project.repo}`),
    ),
    '',
    '## Writing',
    '',
    routeLink('/writing'),
    ...posts.map(post => link(post.data.title, postPath(post.id), post.data.description)),
    '',
    '## Optional',
    '',
    routeLink('/uses'),
    routeLink('/colophon'),
    routeLink('/accessibility'),
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
