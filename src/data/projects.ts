import { facts } from '@src/data/facts';

export type ProjectSlug = 'plusweb' | 'ams-x' | 'mnist' | 'emberlink' | 'holdfast' | 'seamline';

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
  // Off the projects list on the home page. The page stays live and in the sitemap, so a
  // direct link and a search still reach it.
  unlisted?: boolean;
  // A hosted thing a reader can open without installing anything.
  demo?: string;
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

const { mnist, emberlink, holdfast, seamline } = facts;
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
      "An Express-style HTTP framework in C++17, in Microsoft's vcpkg. I first wrote the whole path myself, a blocking accept loop and a parser that split strings, then moved the loop onto libuv and the parsing onto llhttp, the two pieces Node runs on. The trie router, the middleware chain and the request and response layer are mine. 4.8× Express at 5 routes, and flat out to 10,000.",
    specs: [
      { label: 'dependencies', value: 'libuv, llhttp, nlohmann/json' },
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
    tagline: 'Filament swaps for my print shop, driven over MQTT.',
    summary:
      "I run a small 3D printing business, and any filament change past Bambu's own AMS needs a person at the printer. AMS-X moves that loop onto a FastAPI server and a Next.js dashboard that drive the printer over its local MQTT, with each swap planned from the sliced 3MF. A person still feeds the spool until the motor modules work.",
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
    unlisted: true,
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
    unlisted: true,
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
  {
    slug: 'holdfast',
    unlisted: true,
    path: '/projects/holdfast',
    number: '05',
    name: 'Holdfast',
    kind: 'a tracker for broken video',
    tagline: 'Keeping an object\u2019s identity when the picture breaks up.',
    summary:
      'A multi-object tracker for drone video that holds each identity through frame blackouts, frozen feeds, detection dropout and a camera that is itself moving. Headless and CPU-only. Every design decision was tuned on three sequences and scored once on four that were held out, and one of them was reversed because the numbers said so.',
    specs: [
      {
        label: 'scored with',
        value: `TrackEval on VisDrone, ${holdfast.dev} dev / ${holdfast.heldOut} held out`,
      },
      { label: 'the tracker itself', value: `${holdfast.trackerMs} ms a frame` },
      { label: 'end to end', value: `${holdfast.fps.oneCore} fps on one core, with the detector` },
      {
        label: 'ships as',
        value: `a ${holdfast.container.mb} MB container, ${holdfast.container.arches.join(' or ')}`,
      },
    ],
    cta: 'Break the video yourself',
    repo: 'https://github.com/Amsozzer1/holdfast',
    demo: 'https://amsozzer1.github.io/holdfast/',
    stack: ['C++20', 'Eigen', 'ONNX Runtime', 'WebAssembly', 'CMake'],
    programmingLanguage: ['C++20'],
    license: 'MIT',
    runtimePlatform: ['Linux', 'macOS', 'Web browser'],
  },
  {
    slug: 'seamline',
    unlisted: true,
    path: '/projects/seamline',
    number: '06',
    name: 'Seamline',
    kind: 'a weld plan you can review',
    tagline: 'One Rust core, compiled twice, so the client and the server cannot disagree.',
    summary:
      'A stiffened steel panel goes in and a reviewable weld plan comes out: every seam found, put in a build order, checked in 3D, released, and then run by a simulated cell that faults and recovers. The interesting part is not welding \u2014 it is that the browser and the server share one compiled definition of what a valid plan is.',
    specs: [
      {
        label: 'shared core',
        value: `one Rust crate, WASM for ${seamline.wasmTargets.join(' and ')}`,
      },
      { label: 'state', value: 'draft to released, enforced in SQL' },
      { label: 'a run is', value: 'an event log, replayed over SSE' },
      { label: 'sequencing', value: 'rules you can explain, not an optimiser' },
    ],
    cta: 'Open the demo',
    repo: 'https://github.com/Amsozzer1/seamline',
    demo: 'https://seamline.onrender.com',
    stack: ['Rust', 'WebAssembly', 'TypeScript', 'React Three Fiber', 'Postgres'],
    programmingLanguage: ['Rust', 'TypeScript'],
    license: 'MIT',
    runtimePlatform: ['Web browser', 'Node.js'],
  },
];

// What the home page lists. The rest keep their pages.
export const listedProjects = projects.filter(project => !project.unlisted);
