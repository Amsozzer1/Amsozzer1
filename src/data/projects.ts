import { facts } from '@src/data/facts';

export type ProjectSlug = 'plusweb' | 'ams-x' | 'mnist' | 'emberlink';

export interface Project {
  slug: ProjectSlug;
  path: `/projects/${ProjectSlug}`;
  number: string;
  name: string;
  kind: string;
  tagline: string;
  summary: string;
  specs: { label: string; value: string }[];
  cta: string;
  // Where it is published, if anywhere. The page and the JSON-LD both read this, so the
  // install line cannot drift from the one in the graph.
  registry?: { name: string; install: string; url: string };
  // Post ids, newest first. Titles are resolved from the collection so a retitled
  // post cannot leave a stale label behind here.
  writing?: string[];
  repo: string;
  stack: string[];
  programmingLanguage: string[];
  license?: string;
  runtimePlatform: string[];
}

const { mnist, emberlink } = facts;
const count = (value: number) => value.toLocaleString('en-US');

export const projects: Project[] = [
  {
    slug: 'plusweb',
    path: '/projects/plusweb',
    number: '01',
    name: 'PlusWeb',
    kind: 'a web framework',
    tagline: 'An Express-style HTTP framework in C++17.',
    summary:
      'Everything above the socket is mine: the accept loop, the parser, the router, the middleware machinery. A literal path segment always beats a parameter, whatever order you registered them in.',
    specs: [
      { label: 'dependencies', value: 'three — libuv, llhttp, nlohmann/json' },
      { label: 'tested', value: 'GoogleTest, ASan + UBSan in CI' },
      { label: 'install', value: 'vcpkg install amsozzer1-plusweb' },
      { label: 'license', value: 'MIT' },
    ],
    cta: 'Open the playground',
    registry: {
      name: 'vcpkg',
      install: 'vcpkg install amsozzer1-plusweb',
      url: 'https://github.com/microsoft/vcpkg/tree/master/ports/amsozzer1-plusweb',
    },
    writing: ['i-could-not-understand-express-so-i-wrote-my-own'],
    repo: 'https://github.com/Amsozzer1/PlusWeb',
    stack: ['C++17', 'libuv', 'llhttp', 'CMake', 'MIT'],
    programmingLanguage: ['C++17'],
    license: 'MIT',
    runtimePlatform: ['Linux', 'macOS'],
  },
  {
    slug: 'ams-x',
    path: '/projects/ams-x',
    number: '02',
    name: 'AMS-X',
    kind: 'a 3D printer protocol',
    tagline: 'An open modular filament system for Bambu Lab printers.',
    summary:
      'Stock hardware caps multi-material at four spools and asks a human to stand there for every change. None of the protocol is published, so the command set was pulled apart against a live machine.',
    specs: [
      { label: 'plan source', value: 'the sliced .3mf, parsed server-side' },
      { label: 'transport', value: 'MQTT over TLS, FTPS on LAN' },
      { label: 'spool module', value: 'human now, TMC2209 next' },
    ],
    cta: 'How it works',
    writing: ['a-filament-move-is-two-legs', 'driving-a-bambu-lab-printer-over-mqtt'],
    repo: 'https://github.com/Amsozzer1/AMS',
    stack: ['Python', 'FastAPI', 'MQTT', 'ESP32', '3MF'],
    programmingLanguage: ['Python'],
    license: 'MIT',
    runtimePlatform: ['Python', 'ESP32'],
  },
  {
    slug: 'mnist',
    path: '/projects/mnist',
    number: '03',
    name: 'MNIST',
    kind: 'a convnet in a canvas',
    tagline: 'Convolutional digit recognition, served as a static file.',
    summary:
      'Two convolution and pooling stages learn the strokes, then a dense head turns them into ten probabilities. Written from scratch in Python and NumPy, with no deep learning framework on either side: every convolution, ReLU, softmax and gradient is implemented by hand, the weights ship as plain JSON, and the forward pass is written out again in the page. Nothing you draw leaves your machine.',
    specs: [
      {
        label: 'dataset',
        value: `MNIST, ${count(mnist.dataset.train)} / ${count(mnist.dataset.test)}`,
      },
      {
        label: 'shape',
        value: `conv ${mnist.filters[0]} → pool → conv ${mnist.filters[1]} → pool → dense`,
      },
      { label: 'serving', value: 'static hosting, inference client-side' },
      { label: 'in the browser', value: 'no runtime — the forward pass is hand-written' },
    ],
    cta: 'Draw a digit',
    repo: 'https://github.com/Amsozzer1/MNIST',
    stack: ['Python', 'NumPy', 'CNN'],
    programmingLanguage: ['Python'],
    license: 'MIT',
    runtimePlatform: ['Python', 'Web browser'],
  },
  {
    slug: 'emberlink',
    path: '/projects/emberlink',
    number: '04',
    name: 'Emberlink',
    kind: 'a link for bad radio',
    tagline: 'A robot-to-operator video link that stays fresh when the radio does not.',
    summary:
      'A frozen frame that looks live is the worst thing you can put in front of an operator. So when the link degrades this one sends less rather than falling behind: a frame is four independently decodable strips, the pacer always sends from the newest one, alerts and telemetry go ahead of pixels, and every part of the picture shows its own age.',
    specs: [
      { label: 'sender', value: `C++20 on Linux, ${emberlink.strip.perFrame} strips a frame` },
      {
        label: 'rate ladder',
        value: `${emberlink.ladder[0]} to ${emberlink.ladder[emberlink.ladder.length - 1]} strips a second`,
      },
      { label: 'steps down on', value: 'queueing delay, never on loss' },
      { label: 'measured with', value: 'netem, two namespaces, one clock' },
    ],
    cta: 'See what it costs',
    repo: 'https://github.com/Amsozzer1/emberlink',
    stack: ['C++20', 'UDP', 'Linux', 'netem', 'Node'],
    programmingLanguage: ['C++20', 'Python', 'TypeScript'],
    license: 'MIT',
    runtimePlatform: ['Linux'],
  },
];
