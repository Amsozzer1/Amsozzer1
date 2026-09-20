import { facts } from '@src/data/facts';

export type ProjectSlug = 'plusweb' | 'ams-x' | 'mnist';

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
  repo: string;
  stack: string[];
  programmingLanguage: string[];
  license?: string;
  runtimePlatform: string[];
}

const { mnist } = facts;
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
      { label: 'dependencies', value: 'one — nlohmann/json, for response bodies' },
      { label: 'tested', value: 'GoogleTest, ASan + UBSan in CI' },
      { label: 'license', value: 'MIT, installable via CMake' },
    ],
    cta: 'Open the playground',
    repo: 'https://github.com/Amsozzer1/PlusWeb',
    stack: ['C++17', 'POSIX sockets', 'CMake', 'GoogleTest', 'MIT'],
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
      'Two convolution and pooling stages learn the strokes, then a dense head turns them into ten probabilities. Trained with a library, served without one — the weights ship as a plain JSON file and the forward pass is written out by hand in the page. No TensorFlow.js, no ONNX runtime, no WASM blob. Nothing you draw leaves your machine.',
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
    repo: 'https://github.com/Amsozzer1/digit_recognition',
    stack: ['Python', 'TensorFlow', 'CNN'],
    programmingLanguage: ['Python'],
    license: 'MIT',
    runtimePlatform: ['TensorFlow', 'Web browser'],
  },
];
