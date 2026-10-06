export interface Route {
  name: string;
  title: string;
  description: string;
  schema: 'ProfilePage' | 'CollectionPage' | 'WebPage';
  card: Card;
  sources: readonly string[];
  noindex?: boolean;
  // Indexable, but kept out of llms.txt and llms-full.txt.
  unlisted?: boolean;
}

export interface Card {
  kicker: string;
  headline: string;
}

export const routes = {
  '/': {
    name: 'Home',
    title: 'Ahmed Sozzer · Full Stack Engineer · Austin, TX',
    description:
      'Ahmed Sozzer, full-stack engineer at FYCLabs in Austin, TX. Product work in Next.js, React Native, Node and PostgreSQL, and systems work in C++17 and Python on my own time.',
    schema: 'ProfilePage',
    card: {
      kicker: 'austin, tx',
      headline: 'I write the layer most people import.',
    },
    sources: [
      'src/pages/index.astro',
      'src/components/home/Hero.astro',
      'src/components/home/Projects.astro',
      'src/components/home/AboutTeaser.astro',
      'src/data/site.ts',
    ],
  },
  '/experience': {
    name: 'Experience',
    title: 'Experience · FYCLabs, Holiday Channel, Luminii · Ahmed Sozzer',
    description:
      'Full-stack engineer at FYCLabs since May 2025: an insurance platform, a sign-on used by 50,000+ people a day, and a women\u2019s health app. Before that, Holiday Channel and Luminii.',
    schema: 'ProfilePage',
    card: { kicker: 'experience', headline: 'I get paid to delete the manual step.' },
    sources: ['src/pages/experience.astro', 'src/data/resume.json', 'src/data/facts.ts'],
  },
  '/projects/plusweb': {
    name: 'PlusWeb',
    title: 'PlusWeb — an Express-style HTTP framework in C++17 · Ahmed Sozzer',
    description:
      'An Express-style HTTP framework in C++17 on libuv and llhttp, benchmarked against Express on one machine. In Microsoft\u2019s vcpkg registry.',
    schema: 'WebPage',
    card: { kicker: '02 · plusweb', headline: 'An Express-style HTTP framework in C++17.' },
    sources: ['src/pages/projects/plusweb.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/ams-x': {
    name: 'AMS-X',
    title: 'AMS-X · filament swaps past Bambu\u2019s AMS, over MQTT · Ahmed Sozzer',
    description:
      'AMS-X drives every filament swap on a Bambu Lab printer over its local MQTT, past the 4 slots (16 with the hub) of Bambu\u2019s own AMS: a FastAPI server, a Next.js dashboard, and a person feeding spools until the motors work.',
    schema: 'WebPage',
    card: { kicker: '01 · ams-x', headline: 'An open modular filament system, driven over MQTT.' },
    sources: ['src/pages/projects/ams-x.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/pdf-redactor': {
    name: 'pdf-redactor',
    title: 'pdf-redactor · a Terminal-Bench 3 task · Ahmed Sozzer',
    description:
      "A task written to Terminal-Bench 3's spec: build a redactor for court filings that leaves nothing recoverable under the box. Claude Code and Codex scored 0 on every run.",
    schema: 'WebPage',
    card: { kicker: '03 · pdf-redactor', headline: 'A task frontier agents have not passed.' },
    sources: ['src/pages/projects/pdf-redactor.astro', 'src/data/facts.ts'],
  },
  '/projects/mnist': {
    name: 'MNIST',
    title: 'MNIST · a convnet in plain Python · Ahmed Sozzer',
    description:
      'A convolutional network for handwritten digits in plain Python lists, no framework. The dense head trains and is gradient-checked; the conv layers are still frozen.',
    noindex: true,
    schema: 'WebPage',
    card: { kicker: '04 · mnist', headline: 'A convnet that runs with no runtime.' },
    sources: ['src/pages/projects/mnist.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/emberlink': {
    unlisted: true,
    name: 'Emberlink',
    title: 'Emberlink \u2014 a robot video link for bad radio \u00b7 Ahmed Sozzer',
    description:
      'A robot-to-operator thermal link that sends less instead of falling behind when the radio degrades: strips, not frames, and alerts ahead of pixels.',
    schema: 'WebPage',
    card: { kicker: '05 · emberlink', headline: 'Freshness beats completeness.' },
    sources: ['src/pages/projects/emberlink.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/holdfast': {
    unlisted: true,
    name: 'Holdfast',
    title: 'Holdfast \u2014 tracking through blackouts and freezes \u00b7 Ahmed Sozzer',
    description:
      'A C++20 multi-object tracker for drone video that keeps each identity through frame blackouts, frozen feeds and camera motion. Scored with TrackEval.',
    schema: 'WebPage',
    card: { kicker: '06 · holdfast', headline: 'It keeps the ID when the picture does not.' },
    sources: ['src/pages/projects/holdfast.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
  },
  '/projects/seamline': {
    unlisted: true,
    name: 'Seamline',
    title: 'Seamline \u2014 one Rust core, two WebAssembly targets \u00b7 Ahmed Sozzer',
    description:
      'A weld plan you can review in 3D and run on a simulated cell, with the browser and the server sharing one compiled definition of a valid plan.',
    schema: 'WebPage',
    card: { kicker: '07 · seamline', headline: 'One core, compiled twice.' },
    sources: ['src/pages/projects/seamline.astro', 'src/data/projects.ts', 'src/data/facts.ts'],
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
      'How Ahmed Sozzer got here: Pakistan to Chicago at eighteen, community college to the University of Illinois, and a printing business acquired by accident.',
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
      'Accessibility statement for amsozzer.com: the WCAG 2.2 AA target, what the build checks automatically, what is untested by hand, and how to report a problem.',
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
