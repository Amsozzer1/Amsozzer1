export const facts = {
  plusweb: {
    // Every figure below is from the 2026-09-20 profile: one process, one thread, pinned to CPU 0,
    // against Express 5.2.1 on Node 25.6.1 pinned the same way, 32 keep-alive connections.
    box: { cores: 4, cpu: 'Intel i5-7600', os: 'Linux' },
    port: 3000,
    dependencies: 3,
    stats: {
      speedup: '4.8×',
      requestsPerSecond: '91.9k',
      memory: '4.6 MB',
      ceiling: '55%',
    },
    throughput: [
      { routes: 5, plusweb: 91_950, express: 19_236, ratio: '4.8×' },
      { routes: 1_000, plusweb: 90_085, express: 5_639, ratio: '16×' },
      { routes: 10_000, plusweb: 89_636, express: 355, ratio: '253×' },
    ],
    connections: 32,
    p99Ms: { plusweb: 0.545, express: 2.329, ratio: '4.3×' },
    worstCaseMs: { connections: 512, plusweb: 20.67, express: 4804.2, ratio: '232×' },
    starved: { connections: 512, plusweb: 0, express: 264 },
    memoryMb: { routes: 1_000, plusweb: 6.5, express: 97.7, ratio: '15×' },
    miss: { routes: 10_000, plusweb: 76_568, express: 393, ratio: '195×' },
    // A bare epoll server doing no parsing and no routing on the same box and the same pinning.
    ceiling: { requestsPerSecond: 164_736, plusweb: '55%', express: '3.9%' },
    profile: [
      { symbol: 'socket syscalls', percent: 71 },
      { symbol: 'llhttp', percent: 3.0 },
      { symbol: 'onMessageComplete', percent: 1.8 },
      { symbol: 'serialize', percent: 0.5 },
      { symbol: 'the routing trie', percent: 0.5 },
    ],
    // Where the advantage narrows, from the same profile.
    narrows: [
      { case: '100 KB response bodies', ratio: '4.5×' },
      { case: 'no keep-alive', ratio: '4.1×' },
      { case: '16 middleware', ratio: '5.2×' },
    ],
    // Captured on the machine in /uses, over loopback, as the mean of 2,000 requests per route on
    // one keep-alive connection after a warm-up. Higher than the 11 µs the benchmark box implies,
    // because the client here is Python and the transport is macOS loopback.
    transcript: [
      { method: 'GET', path: '/users/new', status: 200, ms: 0.041 },
      { method: 'GET', path: '/users/123', status: 200, ms: 0.038 },
      { method: 'POST', path: '/users', status: 201, ms: 0.039 },
      { method: 'GET', path: '/admin/metrics', status: 404, ms: 0.036 },
    ],
  },
  amsx: {
    stockSpools: 4,
    spools: 'n',
    states: ['retract', 'select', 'feed', 'sense', 'resume'],
    // @TODO: numbers pass - swap durations are planned, not measured; replace them with a filmed, timed cycle
    swap: {
      totalSeconds: 7.2,
      steps: [
        { name: 'retract', ms: 1_400 },
        { name: 'select', ms: 1_200 },
        { name: 'feed', ms: 2_200 },
        { name: 'sense', ms: 600 },
        { name: 'resume', ms: 1_800 },
      ],
    },
    benchMotors: 4,
    mqtt: { port: 8883, topic: 'device/+/report' },
    sampleReport: { gcodeState: 'PAUSE', layer: 48, sequenceId: '2041' },
    stepperDriver: 'TMC2209',
  },
  mnist: {
    dataset: { train: 60_000, test: 10_000 },
    layers: [
      { name: 'input', shape: [28, 28, 1] },
      { name: 'conv 3×3', shape: [26, 26, 32] },
      { name: 'maxpool', shape: [13, 13, 32] },
      { name: 'conv 3×3', shape: [11, 11, 64] },
      { name: 'maxpool', shape: [5, 5, 64] },
      { name: 'flatten', shape: [1_600] },
      { name: 'dense', shape: [64] },
      { name: 'softmax', shape: [10] },
    ],
    filters: [32, 64],
    kernel: 3,
    dense: 64,
    classes: 10,
    parameters: 121_834,
    checkpoint: { epoch: 3, file: 'epoch3.json' },
    // @TODO: numbers pass - 90% at epoch 3 needs retraining (expected 99% or better)
    testAccuracy: 0.9,
    padGrid: 16,
    // @TODO: numbers pass - the landing softmax bars are drawn, not a real model output
    sample: {
      digit: 3,
      bars: [
        { digit: 1, share: 0.05 },
        { digit: 2, share: 0.14 },
        { digit: 3, share: 1 },
        { digit: 5, share: 0.19 },
        { digit: 8, share: 0.26 },
      ],
    },
  },
  experience: {
    since: 2024,
    roles: 3,
    fyclabs: { usersBefore: 700, usersAfter: 5_000, growth: '7×' },
    deliveries: { services: 5, layerWeeks: 2, shipMonths: '<2', engineers: 2 },
    holidayChannel: { months: 5 },
    luminii: { records: '15,000+' },
  },
} as const;
