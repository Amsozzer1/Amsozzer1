interface ToolkitRow {
  label: string;
  items: string[];
  link: { href: string; label: string };
}

const clientWork = { href: '/experience', label: 'the client work' };

export const toolkit: ToolkitRow[] = [
  {
    label: 'languages',
    items: ['TypeScript', 'JavaScript', 'C / C++17', 'Python', 'Java'],
    link: { href: '/projects/plusweb', label: 'the C++ one' },
  },
  {
    label: 'systems',
    items: ['POSIX sockets', 'MQTT', 'multithreading', 'CMake', 'ESP32', 'Linux'],
    link: { href: '/projects/ams-x', label: 'AMS-X' },
  },
  {
    label: 'web',
    items: ['React', 'Next.js', 'TypeScript', 'Node', 'Express', 'FastAPI'],
    link: clientWork,
  },
  {
    label: 'mobile',
    items: ['React Native', 'Expo', 'EAS builds', 'Firebase Auth'],
    link: clientWork,
  },
  {
    label: 'testing & profiling',
    items: ['GoogleTest', 'ASan / UBSan', 'perf', 'load generation'],
    // @TODO: point at the post "The bottleneck was not the router" once it is published
    link: { href: '/writing', label: 'the write-up' },
  },
  {
    label: 'data & cloud',
    items: [
      'PostgreSQL',
      'Prisma',
      'Hasura GraphQL',
      'MongoDB',
      'Redis',
      'GCP',
      'Firebase',
      'Docker',
    ],
    link: clientWork,
  },
  {
    label: 'models',
    items: ['TensorFlow', 'NumPy', 'a forward pass written out by hand'],
    link: { href: '/projects/mnist', label: 'MNIST' },
  },
];
