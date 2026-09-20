export interface Route {
  name: string;
  title: string;
  description: string;
  schema: 'ProfilePage' | 'CollectionPage' | 'WebPage';
  card: Card;
  sources: readonly string[];
}

export interface Card {
  kicker: string;
  headline: string;
}

export const routes = {
  '/': {
    name: 'Home',
    title: 'Ahmed Sozzer — Full Stack Engineer · Austin, TX',
    description:
      'Ahmed Sozzer, full stack engineer in Austin, TX: client-facing product work in Next.js, React Native and Postgres, plus systems work in C++17 and Python.',
    schema: 'ProfilePage',
    card: {
      kicker: 'austin, tx · open to full-time',
      headline: 'I write the layer most people import.',
    },
    sources: [
      'src/pages/index.astro',
      'src/data/site.ts',
      'src/data/projects.ts',
      'src/data/facts.ts',
      'src/data/resume.json',
    ],
  },
  '/experience': {
    name: 'Experience',
    title: 'Experience — FYCLabs, Holiday Channel, Luminii · Ahmed Sozzer',
    description:
      'Three client-facing roles since 2024: full stack engineer at FYCLabs, e-commerce at Holiday Channel, ML pricing at Luminii, and a CS degree from Illinois.',
    schema: 'ProfilePage',
    card: { kicker: 'experience', headline: 'I get paid to delete the manual step.' },
    sources: ['src/pages/experience.astro', 'src/data/resume.json', 'src/data/facts.ts'],
  },
  '/projects/plusweb': {
    name: 'PlusWeb',
    title: 'PlusWeb — an Express-style HTTP framework in C++17 · Ahmed Sozzer',
    description:
      'PlusWeb is an Express-style HTTP framework written on raw POSIX sockets in C++17, with a segment-trie router, benchmarked against Express on the same machine.',
    schema: 'WebPage',
    card: { kicker: '01 — plusweb', headline: 'An Express-style HTTP framework in C++17.' },
    sources: ['src/pages/projects/plusweb.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/ams-x': {
    name: 'AMS-X',
    title: 'AMS-X — a modular filament system driven over MQTT · Ahmed Sozzer',
    description:
      'AMS-X lifts the four-spool limit on Bambu Lab printers: a Python server reads the sliced job and drives every filament swap over reverse-engineered MQTT.',
    schema: 'WebPage',
    card: { kicker: '02 — ams-x', headline: 'An open modular filament system, driven over MQTT.' },
    sources: ['src/pages/projects/ams-x.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/mnist': {
    name: 'MNIST',
    title: 'MNIST in the browser — a convnet with no runtime · Ahmed Sozzer',
    description:
      'A convolutional network for handwritten digits that runs in the page: weights shipped as a static file and a hand-written forward pass, with no ML runtime.',
    schema: 'WebPage',
    card: { kicker: '03 — mnist', headline: 'A convnet that runs with no runtime.' },
    sources: ['src/pages/projects/mnist.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/writing': {
    name: 'Writing',
    title: 'Writing — engineering posts and open threads · Ahmed Sozzer',
    description:
      'Posts by Ahmed Sozzer on systems and client engineering, newest first, plus open threads: unresolved problems in his code, named until they have an answer.',
    schema: 'CollectionPage',
    card: { kicker: 'writing', headline: 'Write-ups, and the threads still open.' },
    sources: ['src/pages/writing/index.astro', 'src/content/writing'],
  },
  '/about': {
    name: 'About',
    title: 'About — the route here, and the habit behind it · Ahmed Sozzer',
    description:
      'How Ahmed Sozzer got here: Pakistan to Chicago at eighteen, community college to the University of Illinois, tutoring and mentor-matching research, and a printing business acquired by accident.',
    schema: 'ProfilePage',
    card: { kicker: 'about', headline: 'Noticing when a person is doing a machine\u2019s job.' },
    sources: ['src/pages/about.astro'],
  },
  '/uses': {
    name: 'Uses',
    title: 'Uses — the hardware and software I work with · Ahmed Sozzer',
    description:
      'The machine, editor, terminal and everyday software Ahmed Sozzer works on, and the four Bambu Lab printers AMS-X is developed against.',
    schema: 'WebPage',
    card: { kicker: 'uses', headline: 'The hardware and software I work with.' },
    sources: ['src/pages/uses.astro'],
  },
  '/colophon': {
    name: 'Colophon',
    title: 'Colophon — how this site is built · Ahmed Sozzer',
    description:
      'How amsozzer.com is built: Astro static output on Cloudflare Workers, Redaction, Uncut Sans and Monaspace type, versions, licences and Lighthouse scores.',
    schema: 'WebPage',
    card: { kicker: 'colophon', headline: 'How this site is built.' },
    sources: ['src/pages/colophon.astro'],
  },
  '/accessibility': {
    name: 'Accessibility',
    title: 'Accessibility — WCAG 2.2 AA statement · Ahmed Sozzer',
    description:
      'Accessibility statement for amsozzer.com: the WCAG 2.2 AA target, what the build checks automatically, what has not been tested by hand yet, and how to report a problem.',
    schema: 'WebPage',
    card: { kicker: 'accessibility', headline: 'What is checked, and what is not.' },
    sources: ['src/pages/accessibility.astro'],
  },
} as const satisfies Record<string, Route>;

export type RoutePath = keyof typeof routes;

export const defaultCard: Card = {
  kicker: 'amsozzer.com',
  headline: 'Ahmed Sozzer — Full Stack Engineer',
};

export const isRoutePath = (path: string): path is RoutePath => Object.hasOwn(routes, path);

export const findRoute = (path: string): Route | undefined =>
  isRoutePath(path) ? routes[path] : undefined;

export const postPath = (id: string) => `/writing/${id}`;
